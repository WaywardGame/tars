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

import Pour from "@wayward/game/game/entity/action/actions/Pour";
import type Item from "@wayward/game/game/item/Item";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { anyWaterTileLocation } from "../../core/navigation/INavigation";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";

import UseItem from "./item/UseItem";

/**
 * Emptys a water container into the ocean
 */
export default class EmptyWaterContainer extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `EmptyWaterContainer:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Emptying ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const targets = context.utilities.tile.getNearestTileLocation(context, anyWaterTileLocation);

		for (const { tile } of targets) {
			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(tile, true));

			objectives.push(new UseItem(Pour, this.item));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}
}
