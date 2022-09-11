
import Cast from "game/entity/action/actions/Cast";

import type Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import { BaseMode } from "./BaseMode";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";
import MoveToWater, { MoveToWaterType } from "../objectives/utility/moveTo/MoveToWater";
import UseItem from "../objectives/other/item/UseItem";
import { MagicalPropertyType } from "game/magic/MagicalPropertyType";
import { SkillType } from "game/entity/IHuman";

/**
 * Fishing
 */
export class AnglerMode extends BaseMode implements ITarsMode {

	// private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		// this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		objectives.push(...await this.getBuildAnotherChestObjectives(context));

		objectives.push(new AcquireInventoryItem("fishing"));

		const ranged = context.inventory.fishing?.description()?.ranged;
		if (ranged !== undefined) {
			const itemRange = ranged.range + (context.inventory.fishing!.magic.get(MagicalPropertyType.Range) ?? 0);
			const range = context.island.rangeFinder(itemRange, context.human.skill.get(SkillType.Fishing), true);

			objectives.push(new MoveToWater(
				MoveToWaterType.FishableWater,
				{
					fishingRange: range,
					moveToAdjacentTile: true,
					// moveToRange: 2, // stay at least 1 extra tile away from it
					disallowBoats: true
				}));

			objectives.push(new UseItem(Cast, "fishing"));
		}

		return objectives;
	}
}
