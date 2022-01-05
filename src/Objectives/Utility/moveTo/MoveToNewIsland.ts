import { IslandId, IslandPosition } from "game/island/IIsland";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";
import Context from "../../../core/context/Context";
import { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
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
