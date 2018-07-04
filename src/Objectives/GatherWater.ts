import { ActionType, SentenceCaseStyle } from "Enums";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { anyWaterTileLocation } from "../Navigation";
import Objective from "../Objective";
import { getNearestTileLocation } from "../Utilities/Tile";
import { moveToFaceTargetWithRetries, MoveResult } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class GatherWater extends Objective {

	constructor(private item: IItem) {
		super();
	}
	
	public getHashCode(): string {
		return `GatherWater:${game.getName(this.item, SentenceCaseStyle.Title, false)}`;
	}
	
	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const targets = await getNearestTileLocation(anyWaterTileLocation, localPlayer);
		
		const moveResult = await moveToFaceTargetWithRetries((ignoredTiles: ITile[]) => {
			for (let i = 0; i < 5; i++) {
				const target = targets[i];
				if (target) {
					const targetTile = game.getTileFromPoint(target.point);
					if (ignoredTiles.indexOf(targetTile) === -1) {
						return target.point;
					}
				}
			}

			return undefined;
		});
		
		if (moveResult === MoveResult.NoTarget) {
			this.log.info("Can't find water");
			return ObjectiveStatus.Complete;

		} else if (moveResult === MoveResult.NoPath) {
			this.log.info("Can't path to water");
			return ObjectiveStatus.Complete;

		} else if (moveResult !== MoveResult.Complete) {
			return;
		}
		
		this.log.info("Gather water");
		
		return new ExecuteAction(ActionType.UseItem, {
			item: this.item,
			useActionType: ActionType.GatherWater
		});
	}
}
