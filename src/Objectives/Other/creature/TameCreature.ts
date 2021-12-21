import { ActionType } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import { itemUtilities } from "../../../utilities/Item";
import { ContextDataType } from "../../../IContext";
import SetContextData from "../../contextData/SetContextData";
import AcquireItemForTaming from "../../acquire/item/AcquireItemForTaming";
import CopyContextData from "../../contextData/CopyContextData";

export default class TameCreature extends Objective {

    constructor(private readonly creature: Creature) {
        super();
    }

    public getIdentifier(): string {
        return `TameCreature:${this.creature}`;
    }

    public getStatus(): string | undefined {
        return `Taming ${this.creature.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (!this.creature.isValid()) {
            return ObjectiveResult.Restart;
        }

        if (this.creature.isTamed() && this.creature.getOwner() === context.player) {
            return ObjectiveResult.Complete;
        }

        const acceptedItems = this.creature.description()?.acceptedItems;
        if (!acceptedItems || acceptedItems.length === 0) {
            return ObjectiveResult.Impossible;
        }

        const objectives: IObjective[] = [];

        const items = itemUtilities.getItemsInInventory(context, false);

        const offerItem = this.creature.offer(items);
        if (offerItem) {
            objectives.push(new SetContextData(ContextDataType.Item1, offerItem));

        } else {
            objectives.push(new AcquireItemForTaming(this.creature));

            // LastAcquiredItem could change between now and when we need it. copy it in Item1
            objectives.push(new CopyContextData(ContextDataType.LastAcquiredItem, ContextDataType.Item1));
        }

        objectives.push(new SetContextData(ContextDataType.TamingCreature, this.creature));

        objectives.push(new MoveToTarget(this.creature, true).trackCreature(this.creature));

        objectives.push(new ExecuteAction(ActionType.Offer, (context, action) => {
            const item = context.getData(ContextDataType.Item1);
            if (!item) {
                this.log.error("Invalid offer item");
                return ObjectiveResult.Restart;
            }

            action.execute(context.player, item);

            return ObjectiveResult.Complete;
        }).setStatus(this));

        objectives.push(new SetContextData(ContextDataType.TamingCreature, undefined));

        objectives.push(new Lambda(async context => {
            return this.creature.isValid() && this.creature.isTamed() && this.creature.getOwner() === context.player ? ObjectiveResult.Complete : ObjectiveResult.Restart;
        }).setStatus(this));

        return objectives;
    }
}
