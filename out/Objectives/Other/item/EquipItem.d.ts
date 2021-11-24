import { EquipType } from "game/entity/IHuman";
import Item from "game/item/Item";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class EquipItem extends Objective {
    private readonly equip;
    private readonly item?;
    constructor(equip: EquipType, item?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
