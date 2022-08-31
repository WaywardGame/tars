import type { ItemType } from "game/item/IItem";

import type Context from "../../../core/context/Context";
import type { IExecutionTree } from "../../../core/planning/IPlan";
import Objective from "../../../core/objective/Objective";
import GatherFromChest from "../../gather/GatherFromChest";
import GatherFromCorpse from "../../gather/GatherFromCorpse";
import GatherFromCreature from "../../gather/GatherFromCreature";
import GatherFromDoodad from "../../gather/GatherFromDoodad";
import GatherFromGround from "../../gather/GatherFromGround";
import GatherFromTerrainResource from "../../gather/GatherFromTerrainResource";
import { IObjective, IObjectivePriority } from "../../../core/objective/IObjective";

export interface IAcquireItemOptions extends IGatherItemOptions {
	disallowCreatureSearch: boolean;
	disallowDoodadSearch: boolean;

	excludeItemTypes: Set<ItemType>;

	disallowTerrain: boolean;
	disallowWell: boolean;

	allowStartingWaterStill: boolean;
	allowWaitingForWater: boolean;
	onlyIdleWhenWaitingForWaterStill?: boolean;
}

export interface IGatherItemOptions {
	requiredMinDur: number;
	requirePlayerCreatedIfCraftable: boolean;
	willDestroyItem: boolean;
}

export default abstract class AcquireBase extends Objective implements IObjective {

	/**
	 * Sort AcquireItem objectives so that objectives with multiple gather objectives will be executed first
	 * This prevents TARS from obtaining one iron ore, then going back to base to smelt it, then going back to rocks to obtain a second (and this repeats)
	 * TARS should objective all the ore at the same time, then go back and smelt.
	 * Higher number = higher priority = it will be executed first
	 */
	public getExecutionPriority(context: Context, tree: IExecutionTree): IObjectivePriority {
		const result: IObjectivePriority = {
			gatherObjectives: 0,
			craftObjectives: 0,
			gatherFromCorpseObjectives: 0,
			gatherFromCreatureObjectives: 0,
			gatherFromChestObjectives: 0,
		};

		const children = tree.groupedAway ? tree.groupedAway.children : tree.children;

		const isAcquireObjective = tree.objective instanceof AcquireBase;
		if (isAcquireObjective) {
			for (const child of children) {
				this.addGatherObjectivePriorities(result, child);
				this.addAcquireObjectivePriorities(result, child);
			}
		}

		for (const child of children) {
			const childResult = this.getExecutionPriority(context, child);
			this.addResult(childResult, result);
		}

		if (isAcquireObjective) {
			const objectiveName = tree.objective.getName();

			if (objectiveName === "AcquireItemWithRecipe") {
				result.craftObjectives++;
			}
		}

		return result;
	}

	private addResult(source: IObjectivePriority, destination: IObjectivePriority) {
		for (const key of Object.keys(source) as Array<keyof IObjectivePriority>) {
			destination[key] += source[key];
		}
	}

	/**
	 * Higher number = higher priority = it will be executed first
	 */
	private addGatherObjectivePriorities(result: IObjectivePriority, tree: IExecutionTree) {
		if (tree.objective instanceof GatherFromCreature) {
			result.gatherObjectives++;
			result.gatherFromCreatureObjectives++;

		} else if (tree.objective instanceof GatherFromCorpse) {
			result.gatherObjectives++;
			result.gatherFromCorpseObjectives++;

		} else if (tree.objective instanceof GatherFromGround) {
			// gather items from the ground before terrain
			result.gatherObjectives++;

		} else if (tree.objective instanceof GatherFromTerrainResource) {
			result.gatherObjectives++;

		} else if (tree.objective instanceof GatherFromDoodad) {
			result.gatherObjectives++;

		} else if (tree.objective instanceof GatherFromChest) {
			// gather from chest last, since the chests are likely in our base
			result.gatherObjectives++;
			result.gatherFromChestObjectives++;
		}
	}

	/**
	 * Higher number = higher priority = it will be executed first
	 */
	private addAcquireObjectivePriorities(result: IObjectivePriority, tree: IExecutionTree) {
		// todo: convert to the new system if needed>?
		// if (tree.objective.getName() === "AcquireItemFromDisassemble") {
		// 	// this objective may be providing items used by others in the tree
		// 	// move this up
		// 	// todo: implement actual objective dependency system? ex: objective B requires objective A to be ran first
		// 	result.priority += 1000000;
		// }
	}

}
