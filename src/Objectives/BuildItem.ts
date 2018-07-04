import { ActionType, SentenceCaseStyle, TerrainType } from "Enums";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { defaultMaxTilesChecked, IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import UseItem from "./UseItem";
import { moveToFaceTarget, findAndMoveToFaceTarget, MoveResult } from "../Utilities/Movement";
import { isGoodBuildTile, getBaseDoodads, hasBase } from "../Utilities/Base";
import { findDoodad } from "../Utilities/Object";

export default class BuildItem extends Objective {

	private target: IVector3 | undefined;

	constructor(private item: IItem) {
		super();
	}

	public getHashCode(): string {
		return `BuildItem:${game.getName(this.item, SentenceCaseStyle.Title, false)}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (calculateDifficulty) {
			return 1;
		}

		let moveResult: MoveResult | undefined;

		if (hasBase(base)) {
			const baseDoodads = getBaseDoodads(base);

			for (const baseDoodad of baseDoodads) {
				moveResult = await findAndMoveToFaceTarget((point: IVector3, tile: ITile) => isGoodBuildTile(base, point, tile), defaultMaxTilesChecked, baseDoodad);
				if (moveResult === MoveResult.Moving || moveResult === MoveResult.Complete) {
					break;
				}
			}
		}

		if (moveResult === undefined || moveResult === MoveResult.NoTarget || moveResult === MoveResult.NoPath) {
			if (this.target === undefined) {
				const targetDoodad = findDoodad(this.getHashCode(), doodad => {
					const description = doodad.description();
					if (!description || !description.isTree) {
						return false;
					}

					// build our base near dirt and trees
					let dirt = 0;
					let grass = 0;

					for (let x = -6; x <= 6; x++) {
						for (let y = -6; y <= 6; y++) {
							if (x === 0 && y === 0) {
								continue;
							}

							const point: IVector3 = {
								x: doodad.x + x,
								y: doodad.y + y,
								z: doodad.z
							};

							const tile = game.getTileFromPoint(point);
							if (!tile.doodad && isGoodBuildTile(base, point, tile)) {
								const tileType = TileHelpers.getType(tile);
								if (tileType === TerrainType.Dirt) {
									dirt++;

								} else if (tileType === TerrainType.Grass) {
									grass++;
								}
							}
						}
					}

					return dirt >= 3 && grass >= 1;
				});

				if (targetDoodad === undefined) {
					this.log.info("No target doodad to orient base around");
					return ObjectiveStatus.Complete;
				}

				let target: IVector3 | undefined;

				for (let x = -6; x <= 6; x++) {
					for (let y = -6; y <= 6; y++) {
						if (x === 0 && y === 0) {
							continue;
						}

						const point: IVector3 = {
							x: targetDoodad.x + x,
							y: targetDoodad.y + y,
							z: targetDoodad.z
						};

						const tile = game.getTileFromPoint(point);
						if (isGoodBuildTile(base, point, tile)) {
							target = point;
							x = 7;
							break;
						}
					}
				}

				this.target = target;

				if (this.target === undefined) {
					this.log.info("No target to build first base item");
					return ObjectiveStatus.Complete;
				}
			}

			moveResult = await moveToFaceTarget(this.target);
		}

		if (moveResult === MoveResult.NoTarget) {
			this.log.info("No target to build item");
			return ObjectiveStatus.Complete;
		}

		if (moveResult === MoveResult.NoPath) {
			this.log.info("No path to build item");
			return ObjectiveStatus.Complete;
		}

		if (moveResult === MoveResult.Complete) {
			this.log.info("Build item");
			return new UseItem(this.item, ActionType.Build);
		}
	}

}
