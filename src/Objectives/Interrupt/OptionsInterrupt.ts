import Player from "game/entity/player/Player";
import { DropLocation, IOptions } from "save/data/ISaveDataGlobal";
import Objects from "utilities/object/Objects";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class OptionsInterrupt extends Objective {

	public static previousOptions: IOptions | undefined;

	private static desiredOptions: Partial<IOptions> = {
		autoAttack: true, // todo: I think this should be false
		autoGatherHarvest: false,
		autoPickup: false,
		dropLocation: DropLocation.Feet,
		dropOnDismantle: false, // todo: why is this false?
		dropOnGatherHarvest: true,
		warnOnDangerousActions: false,
		warnWhenBreakingItems: false,
		warnWhenBreakingItemsOnCraft: false,
	}

	/**
	 * Restores options to the original state before starting TARS
	 */
	public static restore(player: Player) {
		if (!OptionsInterrupt.previousOptions) {
			return;
		}

		for (const key of Objects.keys(OptionsInterrupt.previousOptions)) {
			const optionValue = OptionsInterrupt.previousOptions[key];
			if ((typeof (optionValue) === "boolean" || typeof (optionValue) === "number") && optionValue !== player.options[key]) {
				game.updateOption(player, key, optionValue);
			}
		}

		OptionsInterrupt.previousOptions = undefined;
	}

	public getIdentifier(): string {
		return "OptionsInterrupt";
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	/**
	 * Updates options that helps TARS
	 */
	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!OptionsInterrupt.previousOptions) {
			OptionsInterrupt.previousOptions = Objects.deepClone(context.player.options);
		}

		const updated: string[] = [];

		for (const optionKey of Object.keys(OptionsInterrupt.desiredOptions) as Array<keyof IOptions>) {
			if (context.player.options[optionKey] !== OptionsInterrupt.desiredOptions[optionKey]) {
				updated.push(`Updating ${optionKey}`);
				game.updateOption(context.player, optionKey, OptionsInterrupt.desiredOptions[optionKey] as any);
			}
		}

		if (updated.length > 0) {
			this.log.info(`Updating options. ${updated.join(", ")}`);
			return ObjectiveResult.Pending;
		}

		return ObjectiveResult.Ignore;
	}

}
