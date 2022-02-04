import { ActionType } from "game/entity/action/IAction";
import { QuestType } from "game/entity/player/quest/quest/IQuest";
import { ItemType } from "game/item/IItem";

import ReserveItems from "../core/ReserveItems";
import CompleteQuest from "../quest/CompleteQuest";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItem from "../acquire/item/AcquireItem";
import AnalyzeInventory from "../analyze/AnalyzeInventory";
import ExecuteAction from "../core/ExecuteAction";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";
import MoveToWater from "./moveTo/MoveToWater";
import { ContextDataType } from "../../core/context/IContext";
import SetContextData from "../contextData/SetContextData";

const requiredItems: ItemType[] = [
    ItemType.GoldSword,
    ItemType.GoldenSextant,
    ItemType.GoldCoins,
    ItemType.GoldenChalice,
    ItemType.GoldenKey,
    ItemType.GoldenRing,
];

export default class SailToCivilization extends Objective {

    public getIdentifier(): string {
        return "SailToCivilization";
    }

    public getStatus(): string | undefined {
        return "Sailing to civilization";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const player = context.human.asPlayer;
        if (!player) {
            return ObjectiveResult.Impossible;
        }

        const objectives: IObjective[] = [];

        if (game.isChallenge) {
            const quest = player.quests.getQuests(QuestType.Challenge)?.[0];
            if (quest) {
                objectives.push(new CompleteQuest(quest));
            }

        } else {
            for (const itemType of requiredItems) {
                const items = context.utilities.item.getBaseItemsByType(context, itemType);
                if (items.length === 0) {
                    objectives.push(new AcquireItem(itemType));
                }
            }
        }

        if (!context.inventory.sailBoat) {
            objectives.push(new AcquireItem(ItemType.Sailboat), new AnalyzeInventory());
        }

        if (!game.isChallenge) {
            // todo: add a way to set this only for a specific item?
            objectives.push(new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));

            for (const itemType of requiredItems) {
                const items = context.utilities.item.getBaseItemsByType(context, itemType);
                if (items.length === 0) {
                    objectives.push(new ReserveItems(items[0]).keepInInventory(), new MoveItemIntoInventory(items[0]));
                }
            }
        }

        objectives.push(
            new MoveItemIntoInventory(context.inventory.sailBoat),
            new MoveToWater(true),
            new ExecuteAction(ActionType.SailToCivilization, (context, action) => {
                action.execute(player, context.inventory.sailBoat, true);
                return ObjectiveResult.Complete;
            }).setStatus(this)
        );

        return objectives;
    }

}
