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
import { IObjectivePriority } from "../../../core/objective/IObjective";

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

export default abstract class AcquireBase extends Objective {

	/**
	 * Sort AcquireItem objectives so that objectives with multiple gather objectives will be executed first
	 * This prevents TARS from obtaining one iron ore, then going back to base to smelt it, then going back to rocks to obtain a second (and this repeats)
	 * TARS should objective all the ore at the same time, then go back and smelt.
	 */
	// public sort(context: Context, executionTreeA: IExecutionTree, executionTreeB: IExecutionTree): number {
	// 	const priorityA = this.calculatePriority(context, executionTreeA);
	// 	const priorityB = this.calculatePriority(context, executionTreeB);

	// 	// console.log(`Priority for A is ${priorityA.priority} (crafts: ${priorityA.craftsRequiringNoGatheringCount})`, executionTreeA, priorityA);
	// 	// console.log(`Priority for B is ${priorityB.priority} (crafts: ${priorityB.craftsRequiringNoGatheringCount})`, executionTreeB, priorityB);

	// 	return priorityA.priority === priorityB.priority ? 0 : priorityA.priority < priorityB.priority ? 1 : -1;
	// }

	/**
	 * Sort AcquireItem objectives so that objectives with multiple gather objectives will be executed first
	 * This prevents TARS from obtaining one iron ore, then going back to base to smelt it, then going back to rocks to obtain a second (and this repeats)
	 * TARS should objective all the ore at the same time, then go back and smelt.
	 * Higher number = higher priority = it will be executed first
	 */
	public getExecutionPriority(context: Context, tree: IExecutionTree): IObjectivePriority {
		const result: IObjectivePriority = {
			priority: 0,
			objectiveCount: 0,
			acquireObjectiveCount: 0,
			// emptyAcquireObjectiveCount: 0,
			gatherObjectiveCount: 0,
			chestGatherObjectiveCount: 0,
			craftsRequiringNoGatheringCount: 0,
			// regroupedChildrenCount: 0,
		};

		const children = tree.groupedAway ? tree.groupedAway.children : tree.children;

		const isAcquireObjective = tree.objective instanceof AcquireBase;
		if (isAcquireObjective) {
			result.acquireObjectiveCount++;

			for (const child of children) {
				this.addGatherObjectivePriorities(result, child);
				this.addAcquireObjectivePriorities(result, child);
			}
		}

		for (const child of children) {
			result.objectiveCount++;

			const childResult = this.getExecutionPriority(context, child);
			this.addResult(childResult, result);
		}

		// if (isAcquireObjective && children.length === 0) {
		// 	console.error("how", tree);
		// 	result.emptyAcquireObjectiveCount++;
		// }

		if (isAcquireObjective) {
			const objectiveName = tree.objective.getName();

			if (objectiveName === "AcquireItemWithRecipe") {
				const nonChestGatherObjectives = result.gatherObjectiveCount - result.chestGatherObjectiveCount;

				// prioritize the harder recipe
				result.priority = nonChestGatherObjectives * 50000;

				// result.priority +=
				// if (result.chestGatherObjectiveCount === 0) {
				// 	// this recipe does not require any gathering
				// 	// or all the gather objectives are GatherFromChest's

				// 	// this is an item that we should be able to make immediately, maybe when we're near the base..
				// 	// deprioritize this because we'll eventually get to it.
				// 	// I would rather gather things from around the map first
				// 	// result.priority -= 50000;

				// 	// if (context.utilities.base.isNearBase(context)) {
				// 	// 	// todo: replace isNearBase with something that checks for CompleteRequirements?

				// 	// 	// prioritize acquire item objectives that require no gathering
				// 	// 	// this means the required items are already in the inventory
				// 	result.priority += 100000;

				// 	// prioritize ones with the least amount of gather chest objectives
				// 	result.priority += result.gatherObjectiveCount * -20;

				// 	result.craftsRequiringNoGatheringCount++;

				// } else if (result.gatherObjectiveCount === result.chestGatherObjectiveCount) {
				// 	result.priority += 50000;

				// 	// prioritize ones with the least amount of gather chest objectives
				// 	result.priority += result.gatherObjectiveCount * -20;

				// 	result.craftsRequiringNoGatheringCount++;

				// } else {
				// 	// deprioritize this. it won't be able to run until after other acquire objects ran (ones that gather)
				// 	// an empty acquire objective means the pipeline was goruped together towards the top
				// 	// the gather object has canGroupTogether returning true
				// 	result.priority -= 50000;
				// 	// console.log("DEPRIOING", tree.hashCode, result.priority, result);

				// }
			}
		}

		// console.log("TREE", tree.id, tree.hashCode, result.priority, result);

		// result.priority = tree.difficulty * -1;

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
			result.gatherObjectiveCount++;
			result.priority += 700;

		} else if (tree.objective instanceof GatherFromCorpse) {
			result.gatherObjectiveCount++;
			result.priority += 600;

		} else if (tree.objective instanceof GatherFromGround) {
			// gather items from the ground before terrain
			result.gatherObjectiveCount++;
			result.priority += 500;

		} else if (tree.objective instanceof GatherFromTerrainResource) {
			result.gatherObjectiveCount++;
			result.priority += 200;

		} else if (tree.objective instanceof GatherFromDoodad) {
			result.gatherObjectiveCount++;
			result.priority += 200;

		} else if (tree.objective instanceof GatherFromChest) {
			// gather from chest last, since the chests are likely in our base
			result.gatherObjectiveCount++;
			result.chestGatherObjectiveCount++;
			result.priority += 20;
		}
	}

	/**
	 * Higher number = higher priority = it will be executed first
	 */
	private addAcquireObjectivePriorities(result: IObjectivePriority, tree: IExecutionTree) {
		if (tree.objective.getName() === "AcquireItemFromDisassemble") {
			// this objective may be providing items used by others in the tree
			// move this up
			// todo: implement actual objective dependency system? ex: objective B requires objective A to be ran first
			result.priority += 100000;
		}
	}

}
