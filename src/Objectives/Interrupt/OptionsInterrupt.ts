import { DropLocation } from "entity/action/actions/Drop";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class OptionsInterrupt extends Objective {

	public static changedDropOnGatherHarvest = false;
	public static changedDropOnDismantle = false;

	public static restore() {
		if (OptionsInterrupt.changedDropOnGatherHarvest) {
			OptionsInterrupt.changedDropOnGatherHarvest = false;
			game.updateOption(localPlayer, "dropOnGatherHarvest", false);
		}

		if (OptionsInterrupt.changedDropOnDismantle) {
			OptionsInterrupt.changedDropOnDismantle = false;
			game.updateOption(localPlayer, "dropOnDismantle", false);
		}
	}

	public getIdentifier(): string {
		return "OptionsInterrupt";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
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
