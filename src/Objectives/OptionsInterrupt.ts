import { DropLocation } from "Enums";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";

export default class OptionsInterrupt extends Objective {

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (localPlayer.options.autoPickup) {
			this.log.info("Disabling AutoPickup");
			game.updateOption(localPlayer, "autoPickup", false);
			return;
		}

		if (!localPlayer.options.autoGatherHarvest) {
			this.log.info("Enabling AutoGatherHarvest");
			game.updateOption(localPlayer, "autoGatherHarvest", true);
			return;
		}

		// if (!localPlayer.options.dropOnGather) {
		// 	this.log("Enabling DropOnGather");
		// 	game.updateOption(localPlayer, "DropOnGather", true);
		// 	return;
		// }

		if (localPlayer.options.protectedCraftingItems) {
			this.log.info("Disabling ProtectedCraftingItems");
			game.updateOption(localPlayer, "protectedCraftingItems", false);
			return;
		}

		if (localPlayer.options.dropLocation !== DropLocation.Feet) {
			this.log.info("Setting DropLocation to Feet");
			game.updateOption(localPlayer, "dropLocation", DropLocation.Feet);
			return;
		}

		return ObjectiveStatus.Complete;
	}

}
