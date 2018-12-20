import { ActionType } from "action/IAction";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { defaultMaxTilesChecked, IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getBaseDoodads, hasBase, isGoodBuildTile, findBuildTile } from "../Utilities/Base";
import { findAndMoveToFaceTarget, MoveResult, moveToFaceTarget } from "../Utilities/Movement";
import UseItem from "./UseItem";

const recalculateMovements = 40;

export default class BuildItem extends Objective {

	private target: IVector3 | undefined;
	private movements: number = 0;

	constructor(private readonly item?: IItem) {
		super();
	}

	public getHashCode(): string {
		return `BuildItem:${this.item && this.item.getName(false).getString()}`;
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
				this.log.info("Looking for build tile...");

				this.target = findBuildTile(this.getHashCode(), base);

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

	public onMove() {
		this.movements++;

		if (this.movements >= recalculateMovements) {
			// reset the objective and try to find a base spot (again)
			// if the spot to create a base is very far away, the path to it could be huge
			// we might just find a base while moving there!
			this.movements = 0;
			this.target = undefined;
			localPlayer.walkAlongPath(undefined);
		}
	}
}
