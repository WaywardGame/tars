import Cast from "@wayward/game/game/entity/action/actions/Cast";
import { SkillType } from "@wayward/game/game/entity/skill/ISkills";
import MagicalPropertyType from "@wayward/game/game/magic/MagicalPropertyType";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";

import { MoveToWaterType } from "../../utility/moveTo/MoveToWater";

export default class Fish extends Objective {

	public getIdentifier(): string {
		return "Fish";
	}

	public getStatus(): string | undefined {
		return "Fishing";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectives: IObjective[] = [];

		const { AcquireInventoryItem, MoveToWater, UseItem } = context.objectives;

		objectives.push(new AcquireInventoryItem("fishing"));

		const ranged = context.inventory.fishing?.description?.ranged;
		if (ranged !== undefined) {
			const itemRange = ranged.range + (context.inventory.fishing!.magic?.get(MagicalPropertyType.Range) ?? 0);
			const range = context.island.rangeFinder(itemRange, context.human, SkillType.Fishing, "max");

			objectives.push(new MoveToWater(
				MoveToWaterType.FishableWater,
				{
					fishingRange: range,
					moveToAdjacentTile: true,
					// moveToRange: 2, // stay at least 1 extra tile away from it
					disallowBoats: true,
				}));

			objectives.push(new UseItem(Cast, "fishing"));
		}

		return objectives;
	}

}
