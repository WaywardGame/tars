import Context from "../../../Context";
import { IExecutionTree } from "../../../Core/IPlan";
import Objective from "../../../Objective";
import { isNearBase } from "../../../Utilities/Base";
import GatherFromChest from "../../Gather/GatherFromChest";
import GatherFromCorpse from "../../Gather/GatherFromCorpse";
import GatherFromCreature from "../../Gather/GatherFromCreature";
import GatherFromDoodad from "../../Gather/GatherFromDoodad";
import GatherFromGround from "../../Gather/GatherFromGround";
import GatherFromTerrain from "../../Gather/GatherFromTerrain";

export interface IObjectivePriority {
	priority: number;
	objectiveCount: number;
	acquireObjectiveCount: number;
	emptyAcquireObjectiveCount: number;
	gatherObjectiveCount: number;
	gatherWithoutChestObjectiveCount: number;
	craftsRequiringNoGatheringCount: number;
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

	public calculatePriority(context: Context, tree: IExecutionTree): IObjectivePriority {
		const result: IObjectivePriority = {
			priority: 0,
			objectiveCount: 0,
			acquireObjectiveCount: 0,
			emptyAcquireObjectiveCount: 0,
			gatherObjectiveCount: 0,
			gatherWithoutChestObjectiveCount: 0,
			craftsRequiringNoGatheringCount: 0,
		};

		const isAcquireObjective = tree.objective instanceof AcquireBase;
		if (isAcquireObjective) {
			result.acquireObjectiveCount++;

			for (const child of tree.children) {
				this.addGatherObjectivePriorities(result, child);
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

		if (isAcquireObjective && tree.objective.getName() === "AcquireItemWithRecipe" && result.gatherObjectiveCount === 0) {
			// this recipe does not require any gathering

			if (result.emptyAcquireObjectiveCount === 0) {
				if (isNearBase(context)) {
					// todo: replace isNearBase with something that checks for CompleteRequirements?

					// prioritize acquire item objectives that require no gathering
					// this means the required items are already in the inventory
					result.priority += 50000;
					result.craftsRequiringNoGatheringCount++;
				}

			} else {
				// deprioritize this. it won't be able to run until after other acquire objects ran (ones that gather)
				// an empty acquire objective means the pipeline was goruped together towards the top
				// the gather object has canGroupTogether returning true
				result.priority -= 50000;
			}
		}

		return result;
	}

	public addResult(source: IObjectivePriority, destination: IObjectivePriority) {
		destination.priority += source.priority;
		destination.objectiveCount += source.objectiveCount;
		destination.acquireObjectiveCount += source.acquireObjectiveCount;
		destination.emptyAcquireObjectiveCount += source.emptyAcquireObjectiveCount;
		destination.gatherObjectiveCount += source.gatherObjectiveCount;
		destination.gatherWithoutChestObjectiveCount += source.gatherWithoutChestObjectiveCount;
		destination.craftsRequiringNoGatheringCount += source.craftsRequiringNoGatheringCount;
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

}
