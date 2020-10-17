import ActionExecutor from "entity/action/ActionExecutor";
import actionDescriptions from "entity/action/Actions";
import { ActionType, IActionDescription } from "entity/action/IAction";
import Context from "../Context";

const pendingActions: {
	[index: number]: {
		rejectorTimeoutId: number;
		resolve(success: boolean): void;
	};
} = {};

export async function waitForAction(actionType: ActionType) {
	return new Promise<boolean>(resolve => {
		const rejectorId = setTimeout(() => {
			delete pendingActions[actionType];
			resolve(false);
		}, 1000);

		pendingActions[actionType] = {
			resolve: resolve,
			rejectorTimeoutId: rejectorId,
		};
	});
}

export function postExecuteAction(actionType: ActionType) {
	const pendingAction = pendingActions[actionType];
	if (pendingAction) {
		clearTimeout(pendingAction.rejectorTimeoutId);
		delete pendingActions[actionType];
		pendingAction.resolve(true);
	}
}

export async function executeAction<T extends ActionType>(
	context: Context,
	actionType: T,
	executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never) => void): Promise<void> {
	let waiter: Promise<boolean> | undefined;

	if (context.player.hasDelay()) {
		await new Promise(resolve => {
			const checker = () => {
				if (!context.player.hasDelay()) {
					resolve();
					return;
				}

				setTimeout(checker, 10);
			};

			checker();
		});
	}

	if (multiplayer.isConnected()) {
		// the action won't be executed immediately, we need to setup a callback
		waiter = waitForAction(actionType);
	}

	executor(context, ActionExecutor.get(actionDescriptions[actionType]).skipConfirmation() as any);

	if (waiter) {
		await waiter;
	}
}
