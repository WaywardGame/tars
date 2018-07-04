import { ActionType, DamageType, TerrainType } from "Enums";
import { IContainer } from "item/IItem";
import { ITerrainDescription, ITile } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems, ITerrainSearch } from "../ITars";
import Objective from "../Objective";
import { getBestActionItem } from "../Utilities/Item";
import { MoveResult, moveToFaceTargetWithRetries } from "../Utilities/Movement";
import { getNearestTileLocation } from "../Utilities/Tile";

interface ITerrainSearchTarget {
	search: ITerrainSearch;
	point: IVector3;
	difficulty: number;
}

export default class GatherFromTerrain extends Objective {

	constructor(private search: ITerrainSearch[]) {
		super();
	}

	public getHashCode(): string {
		return `GatherFromTerrain:${this.search.map(search => `${TerrainType[search.type]},${itemManager.getItemTypeGroupName(search.itemType, false)},${search.chance}`).join("|")}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const digTool = getBestActionItem(ActionType.Dig);

		let terrainDescription: ITerrainDescription | undefined;

		let targets: ITerrainSearchTarget[] = [];

		for (const ts of this.search) {
			terrainDescription = Terrains[ts.type];
			if (!terrainDescription) {
				continue;
			}

			const tileLocations = await getNearestTileLocation(ts.type, localPlayer);
			if (tileLocations.length > 0) {
				for (let i = 0; i < 5; i++) {
					const tileLocation = tileLocations[i];
					if (tileLocation) {
						const point = tileLocation.point;

						if (!terrainDescription.gather && (tileLocation.tile.doodad || (tileLocation.tile as IContainer).containedItems)) {
							continue;
						}

						let difficulty = Math.round(Vector2.squaredDistance(localPlayer, point)) + (100 - ts.chance);
						if (!terrainDescription.gather && !digTool) {
							difficulty += 100;
						}

						targets.push({
							search: ts,
							point: point,
							difficulty: difficulty
						});
					}
				}

			}
		}

		if (targets.length === 0) {
			if (calculateDifficulty) {
				return missionImpossible;
			}

			this.log.info("No terrain targets to gather from");
			return ObjectiveStatus.Complete;
		}

		targets = targets.sort((a, b) => a.difficulty > b.difficulty ? 1 : -1);

		// console.log(this.getHashCode(), targets, targets[0].difficulty);

		if (calculateDifficulty) {
			return targets[0].difficulty;
		}

		let selectedTarget: ITerrainSearchTarget | undefined;

		const facingTile = localPlayer.getFacingTile();

		for (let i = 0; i < 8; i++) {
			const target = targets[i];
			if (target) {
				const targetTile = game.getTileFromPoint(target.point);
				if (targetTile === facingTile) {
					terrainDescription = Terrains[target.search.type]!;
					if (!terrainDescription.gather && (targetTile.doodad || (targetTile as IContainer).containedItems)) {
						continue;
					}

					selectedTarget = target;
					break;
				}
			}
		}

		if (!selectedTarget) {
			// todo: fix logic here
			const moveResult = await moveToFaceTargetWithRetries((ignoredTiles: ITile[]) => {
				for (let i = 0; i < targets.length; i++) {
					const target = targets[i];
					if (target) {
						const targetTile = game.getTileFromPoint(target.point);

						terrainDescription = Terrains[target.search.type]!;
						if (!terrainDescription.gather && (targetTile.doodad || (targetTile as IContainer).containedItems)) {
							continue;
						}

						if (ignoredTiles.indexOf(targetTile) === -1) {
							selectedTarget = target;
							return target.point;
						}
					}
				}

				return undefined;
			});

			if (moveResult === MoveResult.NoTarget) {
				this.log.info("Can't find terrain tile nearby");
				return ObjectiveStatus.Complete;

			} else if (moveResult !== MoveResult.Complete) {
				return;
			}
		}

		terrainDescription = Terrains[selectedTarget!.search.type]!;

		const actionType = terrainDescription.gather ? ActionType.Gather : ActionType.Dig;
		const item = terrainDescription.gather ? getBestActionItem(ActionType.Gather, DamageType.Blunt) : digTool;

		return this.executeActionForItem(actionType, { item: item }, this.search.map(search => search.itemType));
	}

	protected getBaseDifficulty(base: IBase, inventory: IInventoryItems): number {
		return 10;
	}

}
