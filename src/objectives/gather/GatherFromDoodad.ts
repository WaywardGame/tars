import type Doodad from "game/doodad/Doodad";
import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { DoodadSearchMap } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromDoodad extends Objective {

	constructor(private readonly itemType: ItemType, private readonly doodadSearchMap: DoodadSearchMap) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromDoodad:${ItemType[this.itemType]}`;
	}

	public getStatus(): string | undefined {
		return `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from a doodad`;
	}

	public override canGroupTogether(): boolean {
		return true;
	}

	public override isDynamic(): boolean {
		// marked as dynamic because the plan is optimized before execution.
		// that means this objective could end up regrouped.
		// the specific objective in the tree might be aiming to gather from some far away place.
		// running it dynamically will end up having it grab from the nearest spot
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return context.utilities.object.findDoodads(context, this.getIdentifier(), (doodad: Doodad) => {
			const searchMap = this.doodadSearchMap.get(doodad.type);
			if (!searchMap) {
				return false;
			}

			const description = doodad.description();
			if (!description) {
				return false;
			}

			const growingStage = doodad.growth;
			if (growingStage === undefined || (description.gather?.[growingStage] === undefined && description.harvest?.[growingStage] === undefined)) {
				return false;
			}

			const difficulty = searchMap.get(growingStage);
			if (difficulty === undefined) {
				return false;
			}

			// todo: use difficulty

			return context.utilities.tile.canGather(context, doodad.tile, true);
		}, 5)
			.map(target => ([
				new MoveToTarget(target, true),
				new ExecuteActionForItem(ExecuteActionType.Doodad, [this.itemType])
					.passAcquireData(this)
					.setStatus(() => `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from ${target.getName()}`),
			]));
	}

	protected override getBaseDifficulty(context: Context): number {
		return 20;
	}

}
