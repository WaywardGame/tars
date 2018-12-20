import { ActionType } from "action/IAction";
import {  } from "Enums";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { anyWaterTileLocation } from "../Navigation";
import Objective from "../Objective";
import { MoveResult, moveToFaceTargetWithRetries } from "../Utilities/Movement";
import { getNearestTileLocation } from "../Utilities/Tile";
import ExecuteAction from "./ExecuteAction";

export default class GatherWater extends Objective {

	constructor(private readonly item: IItem) {
		super();
	}

	public getHashCode(): string {
		return `GatherWater:${this.item && this.item.getName(false).getString()}`;
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

		return new ExecuteAction(ActionType.UseItem, action => action.execute(localPlayer, this.item, ActionType.GatherWater));
	}
}
