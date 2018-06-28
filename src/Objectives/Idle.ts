import { ActionType } from "Enums";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { MoveResult } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";

export default class Idle extends Objective {

	constructor(private move: boolean = true) {
		super();
	}

	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (this.move) {
			const moveResult = await Helpers.findAndMoveToTarget((point: IVector3, tile: ITile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, true);
			if (moveResult !== MoveResult.Complete) {
				this.log.info("Moving to idle position");
				return;
			}
		}

		return new ExecuteAction(ActionType.Idle);
	}

}
