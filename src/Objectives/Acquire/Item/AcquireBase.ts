import type { ItemType } from "game/item/IItem";

import type Context from "../../../core/context/Context";
import type { IExecutionTree } from "../../../core/planning/IPlan";
import Objective from "../../../core/objective/Objective";
import GatherFromChest from "../../gather/GatherFromChest";
import GatherFromCorpse from "../../gather/GatherFromCorpse";
import GatherFromCreature from "../../gather/GatherFromCreature";
import GatherFromDoodad from "../../gather/GatherFromDoodad";
import GatherFromGround from "../../gather/GatherFromGround";
import GatherFromTerrain from "../../gather/GatherFromTerrain";

export interface IAcquireItemOptions extends IGatherItemOptions {
	disableCreatureSearch: boolean;
	disableDoodadSearch: boolean;
	excludeItemTypes: Set<ItemType>;
}

export interface IGatherItemOptions {
	requiredMinDur: number;
	requirePlayerCreatedIfCraftable: boolean;
}

export interface IObjectivePriority {
	priority: number;
	objectiveCount: number;
	acquireObjectiveCount: number;
	emptyAcquireObjectiveCount: number;
	gatherObjectiveCount: number;
	gatherWithoutChestObjectiveCount: number;
	craftsRequiringNoGatheringCount: number;
	regroupedChildrenCount: number;
}

export default abstract class AcquireBase extends Objective {

	/**
	 * Sort AcquireItem objectives so that objectives with multiple gather objectives will be executed first
	 * This prevents TARS from obtaining one iron ore, then going back to base to smelt it, then going back to rocks to obtain a second (and this repeats)
	 * TARS should objective all the ore at the same time, then go back and smelt.
	 */
	public sort(context: Context, executionTreeA: IExecutionTree<any>, executionTreeB: IExecutionTree<any>): number {
		const priorityA = this.calculatePriority(context, executionTreeA);
		const priorityB = this.calculatePriority(context, executionTreeB);

		// console.log(`Priority for A is ${priorityA.priority} (crafts: ${priorityA.craftsRequiringNoGatheringCount})`, executionTreeA, priorityA);
		// console.log(`Priority for B is ${priorityB.priority} (crafts: ${priorityB.craftsRequiringNoGatheringCount})`, executionTreeB, priorityB);

		return priorityA.priority === priorityB.priority ? 0 : priorityA.priority < priorityB.priority ? 1 : -1;
	}

	/**
	 * Higher number = higher priority = it will be executed first
	 */
	public calculatePriority(context: Context, tree: IExecutionTree): IObjectivePriority {
		const result: IObjectivePriority = {
			priority: 0,
			objectiveCount: 0,
			acquireObjectiveCount: 0,
			emptyAcquireObjectiveCount: 0,
			gatherObjectiveCount: 0,
			gatherWithoutChestObjectiveCount: 0,
			craftsRequiringNoGatheringCount: 0,
			regroupedChildrenCount: 0,
		};

		if (tree.groupedAway) {
			result.regroupedChildrenCount++;
		}

		const isAcquireObjective = tree.objective instanceof AcquireBase;
		if (isAcquireObjective) {
			result.acquireObjectiveCount++;

			for (const child of tree.children) {
				this.addGatherObjectivePriorities(result, child);
				this.addAcquireObjectivePriorities(result, child);
			}
		}

		for (const child of tree.children) {
			result.objectiveCount++;

			const childResult = this.calculatePriority(context, child);
			this.addResult(childResult, result);
		}

		if (isAcquireObjective && tree.children.length === 0) {
			result.emptyAcquireObjectiveCount++;
		}

		if (isAcquireObjective) {
			const objectiveName = tree.objective.getName();

			if (objectiveName === "AcquireItemWithRecipe" && result.gatherWithoutChestObjectiveCount === 0) {
				// this recipe does not require any gathering

				if (result.regroupedChildrenCount === 0 && (result.emptyAcquireObjectiveCount === 0 || (result.gatherWithoutChestObjectiveCount === 0 && result.gatherObjectiveCount > 0))) {
					if (context.utilities.base.isNearBase(context)) {
						// todo: replace isNearBase with something that checks for CompleteRequirements?

						// prioritize acquire item objectives that require no gathering
						// this means the required items are already in the inventory
						result.priority += 50000;

						// gatherObjectiveCount is only acquire chest objectives. prioritze ones with the least amount of gather chest objectives
						result.priority += result.gatherObjectiveCount * -20;

						result.craftsRequiringNoGatheringCount++;
					}

				} else {
					// deprioritize this. it won't be able to run until after other acquire objects ran (ones that gather)
					// an empty acquire objective means the pipeline was goruped together towards the top
					// the gather object has canGroupTogether returning true
					result.priority -= 50000;
				}
			}
		}

		return result;
	}

	public addResult(source: IObjectivePriority, destination: IObjectivePriority) {
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
			result.gatherWithoutChestObjectiveCount++;
			result.priority += 700;

		} else if (tree.objective instanceof GatherFromCorpse) {
			result.gatherObjectiveCount++;
			result.gatherWithoutChestObjectiveCount++;
			result.priority += 600;

		} else if (tree.objective instanceof GatherFromGround) {
			// gather items from the ground before terrain
			result.gatherObjectiveCount++;
			result.gatherWithoutChestObjectiveCount++;
			result.priority += 500;

		} else if (tree.objective instanceof GatherFromTerrain) {
			result.gatherObjectiveCount++;
			result.gatherWithoutChestObjectiveCount++;
			result.priority += 200;

		} else if (tree.objective instanceof GatherFromDoodad) {
			result.gatherObjectiveCount++;
			result.gatherWithoutChestObjectiveCount++;
			result.priority += 200;

		} else if (tree.objective instanceof GatherFromChest) {
			// gather from chest last, since the chests are likely in our base
			result.gatherObjectiveCount++;
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
