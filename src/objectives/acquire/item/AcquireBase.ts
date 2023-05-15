/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

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

	/**
	 * Allow crafting for items when we don't have the required doodad in the base
	 */
	allowCraftingForUnmetRequiredDoodads: boolean;

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
			totalGatherObjectives: 0,
			totalCraftObjectives: 0,
			readyToCraftObjectives: 0,
			useProvidedItemObjectives: 0,
			gatherObjectives: {
				GatherFromChest: 0,
				GatherFromCorpse: 0,
				GatherFromCreature: 0,
				GatherFromDoodad: 0,
				GatherFromGround: 0,
				GatherFromTerrainResource: 0,
			},
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
				result.totalCraftObjectives++;

				// UseProvidedItem objectives imply that a dismantle objective is required for it
				if (result.totalGatherObjectives === 0 && result.useProvidedItemObjectives === 0) {
					// this objective can be completed without having to gather anything (all items are in the inventory)
					// prioritize the objective that can be crafted now
					result.readyToCraftObjectives++;
				}
			}
		}

		return result;
	}

	private addResult(source: IObjectivePriority, destination: IObjectivePriority) {
		for (const key of Object.keys(source) as Array<keyof IObjectivePriority>) {
			if (typeof (source[key]) === "number") {
				(destination as any)[key] += source[key] as number;

			} else {
				for (const key2 of Object.keys(source[key])) {
					(destination as any)[key][key2] += (source[key] as any)[key2] as number;
				}
			}
		}
	}

	/**
	 * Higher number = higher priority = it will be executed first
	 */
	private addGatherObjectivePriorities(result: IObjectivePriority, tree: IExecutionTree) {
		if (tree.objective instanceof GatherFromCreature) {
			result.totalGatherObjectives++;
			result.gatherObjectives.GatherFromCreature++;

		} else if (tree.objective instanceof GatherFromCorpse) {
			result.totalGatherObjectives++;
			result.gatherObjectives.GatherFromCorpse++;

		} else if (tree.objective instanceof GatherFromGround) {
			// gather items from the ground before terrain
			result.totalGatherObjectives++;
			result.gatherObjectives.GatherFromGround++;

		} else if (tree.objective instanceof GatherFromTerrainResource) {
			result.totalGatherObjectives++;
			result.gatherObjectives.GatherFromTerrainResource++;

		} else if (tree.objective instanceof GatherFromDoodad) {
			result.totalGatherObjectives++;
			result.gatherObjectives.GatherFromDoodad++;

		} else if (tree.objective instanceof GatherFromChest) {
			// gather from chest last, since the chests are likely in our base
			result.totalGatherObjectives++;
			result.gatherObjectives.GatherFromChest++;
		}
	}

	/**
	 * Higher number = higher priority = it will be executed first
	 */
	private addAcquireObjectivePriorities(result: IObjectivePriority, tree: IExecutionTree) {
		if (tree.objective.getName() === "UseProvidedItem") {
			result.useProvidedItemObjectives++;
		}

		// todo: convert to the new system if needed>?
		// if (tree.objective.getName() === "AcquireItemFromDisassemble") {
		// 	// this objective may be providing items used by others in the tree
		// 	// move this up
		// 	// todo: implement actual objective dependency system? ex: objective B requires objective A to be ran first
		// 	result.priority += 1000000;
		// }
	}

}
