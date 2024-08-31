import { ActionArgumentsOf, ActionType, AnyActionDescription } from "@wayward/game/game/entity/action/IAction";
import Message from "@wayward/game/language/dictionary/Message";

import type Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";

export type GetActionArguments<T extends AnyActionDescription, AV = ActionArgumentsOf<T>> = AV | ((context: Context) => AV | ObjectiveResult.Complete | ObjectiveResult.Restart);

export class ActionUtilities {

	private pendingActions: Record<number, {
		rejectorTimeoutId: number;
		resolve(success: boolean): void;
	}> = {};

	public async executeAction<T extends AnyActionDescription>(
		context: Context,
		action: T,
		args: GetActionArguments<T>,
		expectedMessages?: Set<Message>,
		expectedCannotUseResult: ObjectiveResult = ObjectiveResult.Restart): Promise<ObjectiveResult> {
		if (!game.playing) {
			return ObjectiveResult.Restart;
		}

		if (context.options.freeze) {
			return ObjectiveResult.Pending;
		}

		let waiter: Promise<boolean> | undefined;

		if (context.human.hasDelay()) {
			await new Promise<void>(resolve => {
				const checker = () => {
					if (!context.human.hasDelay()) {
						resolve();
						return;
					}

					setTimeout(checker, 5);
				};

				checker();
			});
		}

		if (!game.playing) {
			return ObjectiveResult.Restart;
		}

		const actionType = action.type!;

		const actionArgs = typeof (args) === "function" ? args(context) : args;
		if (typeof (actionArgs) === "number") {
			return actionArgs;
		}

		const canUseResult = action.canUse(context.human, ...actionArgs);
		if (!canUseResult.usable) {
			const message = typeof canUseResult.message === "object" ? canUseResult.message.message : canUseResult.message;
			if (message !== undefined && expectedMessages?.has(message)) {
				return expectedCannotUseResult;
			}

			context.log.warn(`Tried to use an action that is not usable. Action: ${ActionType[actionType]}. Arguments: ${actionArgs.join(", ")}. Message: ${Message[message!]}`);

			return ObjectiveResult.Restart;
		}

		if (multiplayer.isConnected) {
			// the action won't be executed immediately, we need to setup a callback
			waiter = this.waitForAction(actionType);
		}

		multiplayer.executeClientside(() => {
			action.skipConfirmation().execute(context.human, ...actionArgs);
		});

		if (waiter) {
			await waiter;
		}

		return ObjectiveResult.Complete;
	}

	public postExecuteAction(actionType: ActionType): void {
		const pendingAction = this.pendingActions[actionType];
		if (pendingAction) {
			window.clearTimeout(pendingAction.rejectorTimeoutId);
			delete this.pendingActions[actionType];
			pendingAction.resolve(true);
		}
	}

	private async waitForAction(actionType: ActionType): Promise<boolean> {
		return new Promise<boolean>(resolve => {
			const rejectorId = window.setTimeout(() => {
				delete this.pendingActions[actionType];
				resolve(false);
			}, 1000);

			this.pendingActions[actionType] = {
				resolve: resolve,
				rejectorTimeoutId: rejectorId,
			};
		});
	}

}
