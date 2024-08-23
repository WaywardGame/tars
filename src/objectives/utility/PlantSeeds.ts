/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Item from "@wayward/game/game/item/Item";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Restart from "../core/Restart";
import PlantSeed from "../other/item/PlantSeed";

export default class PlantSeeds extends Objective {

	constructor(private readonly seeds: Item[]) {
		super()
	}

	public getIdentifier(): string {
		return `PlantSeeds:${this.seeds.join(",")}`;
	}

	public getStatus(): string | undefined {
		return "Planting seeds";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const seed of this.seeds) {
			objectivePipelines.push([
				new PlantSeed(seed),
				new Restart(), // there might be more seeds to plant, so restart after
			]);
		}

		return objectivePipelines;
	}

}
