import { ActionType } from "Enums";
import { ExecuteArgument } from "action/IAction";

const pendingActions: {
	[index: number]: {
		rejectorTimeoutId: number;
		resolve(success: boolean): void;
	};
} = {};

export function waitForAction(actionType: ActionType) {
	return new Promise<boolean>(resolve => {
		const rejectorId = setTimeout(() => {
			delete pendingActions[actionType];
			resolve(false);
		}, 1000);

		pendingActions[actionType] = {
			resolve: resolve,
			rejectorTimeoutId: rejectorId
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

export async function executeAction(actionType: ActionType, executeArgument?: ExecuteArgument) {
	let waiter: Promise<boolean> | undefined;

	if (localPlayer.hasDelay()) {
		await new Promise(resolve => {
			const checker = () => {
				if (!localPlayer.hasDelay()) {
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

	actionManager.execute(localPlayer, actionType, executeArgument);

	if (waiter) {
		await waiter;
	}
}
