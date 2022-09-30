import { EquipType } from "game/entity/IHuman";
import { IContainer, ItemType } from "game/item/IItem";
import Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import BuildItem from "../objectives/other/item/BuildItem";
import EquipItem from "../objectives/other/item/EquipItem";

/**
 * Common stuff that multiple modes would want to leverage
 */
export abstract class BaseMode {

    protected async getCommonInitialObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
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

    protected async getBuildAnotherChestObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        if (!context.base.buildAnotherChest) {
            context.base.buildAnotherChest = true;

            if (context.base.chest.length > 0) {
                for (const c of context.base.chest) {
                    if ((context.human.island.items.computeContainerWeight(c as IContainer) / context.human.island.items.getWeightCapacity(c)!) < 0.9) {
                        context.base.buildAnotherChest = false;
                        break;
                    }
                }
            }
        }

        if (context.base.buildAnotherChest && context.inventory.chest === undefined) {
            // mark that we should build a chest (memory)
            // we need to do this to prevent a loop
            // if we take items out of a chest to build another chest,
            // the weight capacity could go back under the threshold. and then it wouldn't want to build another chest
            // this is reset to false in baseInfo.onAdd
            context.base.buildAnotherChest = true;

            // probably not needed?
            // const chopItem = context.utilities.item.getBestTool(context, ActionType.Chop, DamageType.Slashing);
            // if (chopItem === undefined) {
            // 	objectives.push([new AcquireItemForAction(ActionType.Chop)]);
            // }

            objectives.push(new AcquireInventoryItem("shovel"));
            objectives.push(new AcquireInventoryItem("knife"));
            objectives.push(new AcquireInventoryItem("axe"));
            objectives.push([new AcquireInventoryItem("chest"), new BuildItem()]);
        }

        return objectives;
    }
}
