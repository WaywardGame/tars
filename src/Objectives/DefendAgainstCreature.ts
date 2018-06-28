import { ICreature } from "creature/ICreature";
import { IStat, Stat } from "entity/IStats";
import { CreatureType } from "Enums";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import Objective from "../Objective";

export default class DefendAgainstCreature extends Objective {

	constructor(private creature: ICreature) {
		super();
	}

	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const creature = this.creature;
		if (creature.getStat<IStat>(Stat.Health).value <= 0 || creature.getTile().creature === undefined) {
			return ObjectiveStatus.Complete;
		}

		if (creature.type === CreatureType.Shark) {
			// ignore it, run away
			return ObjectiveStatus.Complete;
		}

		// todo: optimize damage type for equip?
		Helpers.moveToTarget(creature, true);
	}

}
