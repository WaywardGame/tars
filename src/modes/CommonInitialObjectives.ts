import { DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { EquipType } from "game/entity/IHuman";
import { ItemType, ItemTypeGroup } from "game/item/IItem";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AcquireItemByGroup from "../objectives/acquire/item/AcquireItemByGroup";
import AcquireItemForAction from "../objectives/acquire/item/AcquireItemForAction";
import AcquireItemForDoodad from "../objectives/acquire/item/AcquireItemForDoodad";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import BuildItem from "../objectives/other/item/BuildItem";
import EquipItem from "../objectives/other/item/EquipItem";
import { log } from "../utilities/Logger";

export async function getCommonInitialObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
    const objectives: Array<IObjective | IObjective[]> = [];

    if (context.inventory.axe === undefined) {
        objectives.push([new AcquireItem(ItemType.StoneAxe), new AnalyzeInventory()]);
    }

    if (context.inventory.pickAxe === undefined) {
        objectives.push([new AcquireItem(ItemType.StonePickaxe), new AnalyzeInventory()]);
    }

    if (context.base.campfire.length === 0 && context.inventory.campfire === undefined) {
        log.info("Need campfire");
        objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitCampfire), new BuildItem(), new AnalyzeBase()]);
    }

    if (context.inventory.fireStarter === undefined) {
        log.info("Need fire starter");
        objectives.push([new AcquireItemForAction(ActionType.StartFire), new AnalyzeInventory()]);
    }

    if (context.inventory.fireKindling === undefined || context.inventory.fireKindling.length === 0) {
        log.info("Need fire kindling");
        objectives.push([new AcquireItemByGroup(ItemTypeGroup.Kindling), new AnalyzeInventory()]);
    }

    if (context.inventory.fireTinder === undefined) {
        log.info("Need fire tinder");
        objectives.push([new AcquireItemByGroup(ItemTypeGroup.Tinder), new AnalyzeInventory()]);
    }

    // if (context.inventory.fireStoker === undefined || context.inventory.fireStoker.length < 4) {
    // 	objectives.push([new AcquireItemForAction(ActionType.StokeFire), new AnalyzeInventory()]);
    // }

    if (context.inventory.shovel === undefined) {
        objectives.push([new AcquireItemForAction(ActionType.Dig), new AnalyzeInventory()]);
    }

    if (context.inventory.knife === undefined) {
        objectives.push([new AcquireItem(ItemType.StoneKnife), new AnalyzeInventory()]);
    }

    if (context.inventory.bed === undefined) {
        objectives.push([new AcquireItemByGroup(ItemTypeGroup.Bedding), new AnalyzeInventory()]);
    }

    if (context.inventory.equipSword === undefined) {
        objectives.push([new AcquireItem(ItemType.WoodenSword), new AnalyzeInventory(), new EquipItem(EquipType.LeftHand)]);
    }

    const chest = context.human.getEquippedItem(EquipType.Chest);
    if (chest === undefined || chest.type === ItemType.TatteredClothShirt) {
        objectives.push([new AcquireItem(ItemType.BarkTunic), new AnalyzeInventory(), new EquipItem(EquipType.Chest)]);
    }

    const legs = context.human.getEquippedItem(EquipType.Legs);
    if (legs === undefined || legs.type === ItemType.TatteredClothTrousers) {
        objectives.push([new AcquireItem(ItemType.BarkLeggings), new AnalyzeInventory(), new EquipItem(EquipType.Legs)]);
    }

    if (context.inventory.equipShield === undefined) {
        objectives.push([new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new EquipItem(EquipType.RightHand)]);
    }

    return objectives;
}
