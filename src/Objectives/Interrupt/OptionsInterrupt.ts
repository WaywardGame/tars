import Player from "game/entity/player/Player";
import { DropLocation, IOptions } from "save/data/ISaveDataGlobal";
import Objects from "utilities/object/Objects";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class OptionsInterrupt extends Objective {

	public static previousOptions: IOptions | undefined;

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

	/**
	 * Updates options that helps TARS
	 */
	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!OptionsInterrupt.previousOptions) {
			OptionsInterrupt.previousOptions = Objects.deepClone(context.player.options);
		}

		const updated: string[] = [];

		if (context.player.options.autoPickup) {
			updated.push("Disabling AutoPickup");
			game.updateOption(context.player, "autoPickup", false);
		}

		if (context.player.options.autoGatherHarvest) {
			updated.push("Disabling AutoGatherHarvest");
			game.updateOption(context.player, "autoGatherHarvest", false);
		}

		if (!context.player.options.autoAttack) {
			updated.push("Enabling AutoAttack");
			game.updateOption(context.player, "autoAttack", true);
		}

		if (!context.player.options.dropOnGatherHarvest) {
			updated.push("Enabling DropOnGatherHarvest");
			game.updateOption(context.player, "dropOnGatherHarvest", true);
		}

		// if (!context.player.options.dropOnDismantle) {
		//	updated.push("Enabling DropOnDismantle");
		// 	game.updateOption(context.player, "dropOnDismantle", true);
		// }

		if (context.player.options.dropOnDismantle) {
			updated.push("Disabling DropOnDismantle");
			game.updateOption(context.player, "dropOnDismantle", false);
		}

		if (context.player.options.dropLocation !== DropLocation.Feet) {
			updated.push("Setting DropLocation to Feet");
			game.updateOption(context.player, "dropLocation", DropLocation.Feet);
		}

		if (updated.length > 0) {
			this.log.info(`Updating options. ${updated.join(", ")}`);
			return ObjectiveResult.Pending;
		}

		return ObjectiveResult.Ignore;
	}

}
