import SailToCivilizationAction from "@wayward/game/game/entity/action/actions/SailToCivilization";
import { QuestType } from "@wayward/game/game/entity/player/quest/quest/IQuest";
import { ItemType } from "@wayward/game/game/item/IItem";

import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
import AcquireItem from "../acquire/item/AcquireItem";
import SetContextData from "../contextData/SetContextData";
import ExecuteAction from "../core/ExecuteAction";
import ReserveItems from "../core/ReserveItems";
import MoveItemsIntoInventory from "../other/item/MoveItemsIntoInventory";
import CompleteQuest from "../quest/CompleteQuest";
import MoveToWater, { MoveToWaterType } from "./moveTo/MoveToWater";

const requiredItems: ItemType[] = [
	ItemType.GoldShortSword,
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

		objectives.push(new AcquireInventoryItem("sailboat"));

		if (!game.isChallenge) {
			// todo: add a way to set this only for a specific item?
			objectives.push(new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));

			for (const itemType of requiredItems) {
				const items = context.utilities.item.getBaseItemsByType(context, itemType);
				if (items.length === 0) {
					objectives.push(new ReserveItems(items[0]).keepInInventory(), new MoveItemsIntoInventory(items[0]));
				}
			}
		}

		objectives.push(
			new MoveItemsIntoInventory(context.inventory.sailboat),
			new MoveToWater(MoveToWaterType.SailAwayWater),
			new ExecuteAction(SailToCivilizationAction, [context.inventory.sailboat, true]).setStatus(this),
		);

		return objectives;
	}

}
