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

		if (context.player.options.autoPickup) {
			this.log.info("Disabling AutoPickup");
			game.updateOption(context.player, "autoPickup", false);
			return ObjectiveResult.Pending;
		}

		if (!context.player.options.autoGatherHarvest) {
			this.log.info("Enabling AutoGatherHarvest");
			game.updateOption(context.player, "autoGatherHarvest", true);
			return ObjectiveResult.Pending;
		}

		if (!context.player.options.autoAttack) {
			this.log.info("Enabling AutoAttack");
			game.updateOption(context.player, "autoAttack", true);
			return ObjectiveResult.Pending;
		}

		if (!context.player.options.dropOnGatherHarvest) {
			this.log.info("Enabling DropOnGatherHarvest");
			game.updateOption(context.player, "dropOnGatherHarvest", true);
			return ObjectiveResult.Pending;
		}

		// if (!context.player.options.dropOnDismantle) {
		// 	this.log.info("Enabling DropOnDismantle");
		// 	game.updateOption(context.player, "dropOnDismantle", true);
		// 	return ObjectiveResult.Pending;
		// }

		if (context.player.options.dropOnDismantle) {
			this.log.info("Disabling DropOnDismantle");
			game.updateOption(context.player, "dropOnDismantle", false);
			return ObjectiveResult.Pending;
		}

		if (context.player.options.dropLocation !== DropLocation.Feet) {
			this.log.info("Setting DropLocation to Feet");
			game.updateOption(context.player, "dropLocation", DropLocation.Feet);
			return ObjectiveResult.Pending;
		}

		return ObjectiveResult.Ignore;
	}

}
