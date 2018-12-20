import { ActionType } from "action/IAction";
import { EquipType } from "Enums";
import { IItem } from "item/IItem";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";

export default class Equip extends Objective {

	constructor(private readonly item: IItem, private readonly equip?: EquipType) {
		super();
	}

	public getHashCode(): string {
		return `Equip:${this.item && this.item.getName(false).getString()}`;
	}

	public async onExecute(base: IBase): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (this.equip !== undefined) {
			return new ExecuteAction(ActionType.Equip, action => action.execute(localPlayer, this.item!, this.equip!));

		} else {
			return new ExecuteAction(ActionType.Unequip, action => action.execute(localPlayer, this.item!));
		}
	}

}
