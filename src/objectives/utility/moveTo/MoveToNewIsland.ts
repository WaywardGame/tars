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

import type { IslandId } from "@wayward/game/game/island/IIsland";
import { IslandPosition } from "@wayward/game/game/island/IIsland";
import { Direction } from "@wayward/game/utilities/math/Direction";
import Vector2 from "@wayward/game/utilities/math/Vector2";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToIsland from "./MoveToIsland";

export default class MoveToNewIsland extends Objective {

	public getIdentifier(): string {
		return "MoveToNewIsland";
	}

	public getStatus(): string | undefined {
		return "Moving to a new island";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const unvisitedIslands: IslandId[] = [];

		for (const direction of Direction.CARDINALS) {
			const movement = Vector2.DIRECTIONS[direction];

			const position = {
				x: context.island.position.x + movement.x,
				y: context.island.position.y + movement.y,
			};

			const islandId = IslandPosition.toId(position);
			if (!game.islands.has(islandId)) {
				unvisitedIslands.push(islandId);
			}
		}

		if (unvisitedIslands.length === 0) {
			this.log.info("No unvisited islands. Going to visit a previous one");

			for (const direction of Direction.CARDINALS) {
				const movement = Vector2.DIRECTIONS[direction];

				const position = {
					x: context.island.position.x + movement.x,
					y: context.island.position.y + movement.y,
				};

				unvisitedIslands.push(IslandPosition.toId(position));
			}
		}

		const objectivePipelines: IObjective[][] = [];

		for (const islandId of unvisitedIslands) {
			objectivePipelines.push([new MoveToIsland(islandId)]);
		}

		return objectivePipelines;
	}

}
