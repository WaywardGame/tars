import { ActionType, EquipType } from "Enums";
import { IItem } from "item/IItem";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";

export default class Equip extends Objective {

	constructor(private item: IItem, private equip?: EquipType) {
		super();
	}

	public async onExecute(base: IBase): Promise<IObjective | ObjectiveStatus | number | undefined> {
		return new ExecuteAction(this.equip !== undefined ? ActionType.Equip : ActionType.Unequip, {
			item: this.item,
			equipSlot: this.equip
		});
	}

}
