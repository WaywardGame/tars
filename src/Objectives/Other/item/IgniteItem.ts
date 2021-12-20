import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";
import { EquipType } from "game/entity/IHuman";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import AcquireBuildMoveToFire from "../../acquire/doodad/AcquireBuildMoveToFire";
import EquipItem from "./EquipItem";

import UseItem from "./UseItem";

export default class IgniteItem extends Objective {

    constructor(private readonly item?: Item) {
        super();
    }

    public getIdentifier(): string {
        return `IgniteItem:${this.item}`;
    }

    public getStatus(): string | undefined {
        return `Igniting ${this.item?.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const item = this.item ?? context.getData(ContextDataType.LastAcquiredItem);
        if (!item) {
            this.log.error("Invalid ignite item");
            return ObjectiveResult.Restart;
        }

        const description = item.description();
        if (!description || !description.lit || !description.use?.includes(ActionType.Ignite)) {
            this.log.error(`Invalid ignite item. ${item}`);
            return ObjectiveResult.Impossible;
        }

        return [
            new AcquireBuildMoveToFire(),
            new EquipItem(EquipType.Held, item),
            new UseItem(ActionType.Ignite, item),
        ];
    }

}
