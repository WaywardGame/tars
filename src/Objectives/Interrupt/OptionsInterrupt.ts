import { DropLocation } from "entity/action/actions/Drop";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class OptionsInterrupt extends Objective {

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

		// if (!context.player.options.dropOnGather) {
		// 	this.log("Enabling DropOnGather");
		// 	game.updateOption(context.player, "DropOnGather", true);
		// 	return;
		// }

		if (context.player.options.protectedCraftingItems) {
			this.log.info("Disabling ProtectedCraftingItems");
			game.updateOption(context.player, "protectedCraftingItems", false);
			return ObjectiveResult.Pending;
		}

		if (context.player.options.protectedCraftingItemContainers) {
			this.log.info("Disabling protectedCraftingItemContainers");
			game.updateOption(context.player, "protectedCraftingItemContainers", false);
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
