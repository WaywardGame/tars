import { ActionType } from "action/IAction";
import {  } from "Enums";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { anyWaterTileLocation } from "../Navigation";
import Objective from "../Objective";
import { MoveResult, moveToFaceTargetWithRetries, moveToFaceTarget } from "../Utilities/Movement";
import { getNearestTileLocation } from "../Utilities/Tile";
import ExecuteAction from "./ExecuteAction";
import { IBase } from "../ITars";
import { getTileId } from "utilities/TilePosition";

export default class GatherWater extends Objective {

	constructor(private readonly item: IItem) {
		super();
	}

	public getHashCode(): string {
		return `GatherWater:${this.item && this.item.getName(false).getString()}`;
	}

	public async onExecute(base: IBase): Promise<IObjective | ObjectiveStatus | number | undefined> {
		// look for water in wells first
		for (const well of base.wells!) {
			const wellData = game.wellData[getTileId(well.x, well.y, well.z)];
			if (wellData && (wellData.quantity >= 1 || wellData.quantity === -1)) {
				this.log.info("Gather water from a well");

				const moveResult = await moveToFaceTarget(well);
				if (moveResult !== MoveResult.NoPath) {
					if (moveResult === MoveResult.Moving) {
						return;
					}

					this.log.info("Gather water from the well");
					return new ExecuteAction(ActionType.UseItem, action => action.execute(localPlayer, this.item, ActionType.GatherWater));

				} else {
					this.log.info("No path to well");
				}
			}
		}
		
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
		
		if (game.isTileFull(localPlayer.getFacingTile())) {
			this.log.info("Tile is full, pickup all items first");
			return new ExecuteAction(ActionType.PickupAllItems, action => action.execute(localPlayer));
		}

		return new ExecuteAction(ActionType.UseItem, action => action.execute(localPlayer, this.item, ActionType.GatherWater));
	}
}
