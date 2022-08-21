import { EquipType } from "game/entity/IHuman";
import { ItemType } from "game/item/IItem";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import BuildItem from "../objectives/other/item/BuildItem";
import EquipItem from "../objectives/other/item/EquipItem";

export async function getCommonInitialObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
    const objectives: Array<IObjective | IObjective[]> = [];

    objectives.push(new AcquireInventoryItem("axe"));
    objectives.push(new AcquireInventoryItem("pickAxe"));

    if (context.base.campfire.length === 0) {
        objectives.push([new AcquireInventoryItem("campfire"), new BuildItem()]);
    }

    objectives.push(new AcquireInventoryItem("fireStarter"));
    objectives.push(new AcquireInventoryItem("fireKindling"));
    objectives.push(new AcquireInventoryItem("fireTinder"));
    objectives.push(new AcquireInventoryItem("shovel"));
    objectives.push(new AcquireInventoryItem("knife"));
    objectives.push(new AcquireInventoryItem("bed"));

    if (!context.options.lockEquipment) {
        objectives.push([new AcquireInventoryItem("equipSword"), new EquipItem(EquipType.MainHand)]);

        const chest = context.human.getEquippedItem(EquipType.Chest);
        if (chest === undefined || chest.type === ItemType.TatteredClothShirt) {
            objectives.push([new AcquireItem(ItemType.BarkTunic), new AnalyzeInventory(), new EquipItem(EquipType.Chest)]);
        }

        const legs = context.human.getEquippedItem(EquipType.Legs);
        if (legs === undefined || legs.type === ItemType.TatteredClothTrousers) {
            objectives.push([new AcquireItem(ItemType.BarkLeggings), new AnalyzeInventory(), new EquipItem(EquipType.Legs)]);
        }

        objectives.push([new AcquireInventoryItem("equipShield"), new EquipItem(EquipType.OffHand)]);
    }

    return objectives;
}
