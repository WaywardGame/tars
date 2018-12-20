import { ActionType } from "action/IAction";
import { ICreature } from "creature/ICreature";
import { IStat, Stat } from "entity/IStats";
import { CreatureType } from "Enums";
import { getDirectionFromMovement } from "player/IPlayer";
import { IObjective, ObjectiveStatus } from "../IObjective";
import Objective from "../Objective";
import { moveAwayFromTarget, MoveResult, moveToFaceTarget } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class DefendAgainstCreature extends Objective {

	constructor(private readonly creature: ICreature) {
		super();
	}

	public getHashCode(): string {
		return `DefendAgainstCreature:${this.creature.getName(false).getString()}`;
	}

	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const creature = this.creature;
		if (creature.getStat<IStat>(Stat.Health).value <= 0 || creature.getTile().creature === undefined) {
			return ObjectiveStatus.Complete;
		}

		if (creature.type === CreatureType.Shark) {
			// run away
			await moveAwayFromTarget(creature);

			return ObjectiveStatus.Complete;
		}

		const moveResult = await moveToFaceTarget(creature);
		if (moveResult !== MoveResult.Complete) {
			return;
		}

		// todo: optimize damage type for equip?

		// move into the creature to attack
		const direction = getDirectionFromMovement(creature.x - localPlayer.x, creature.y - localPlayer.y);

		return new ExecuteAction(ActionType.Move, action => action.execute(localPlayer, direction));
	}

}
