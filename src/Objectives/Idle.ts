import { ActionType } from "action/IAction";
import {  } from "Enums";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import { IObjective, ObjectiveStatus } from "../IObjective";
import Objective from "../Objective";
import { findAndMoveToTarget, MoveResult } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class Idle extends Objective {

	constructor(private readonly move: boolean = true) {
		super();
	}
	
	public getHashCode(): string {
		return "Idle";
	}
	
	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (this.move) {
			const moveResult = await findAndMoveToTarget((point: IVector3, tile: ITile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad);
			if (moveResult !== MoveResult.Complete) {
				this.log.info("Moving to idle position");
				return;
			}
		}

		return new ExecuteAction(ActionType.Idle, action => action.execute(localPlayer));
	}

}
