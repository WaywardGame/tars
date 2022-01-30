import type { IQuestRequirement } from "game/entity/player/quest/requirement/IRequirement";
import { QuestRequirementType } from "game/entity/player/quest/requirement/IRequirement";
import type { QuestInstance } from "game/entity/player/quest/QuestManager";
import Enums from "utilities/enum/Enums";
import type { ItemType, ItemTypeGroup } from "game/item/IItem";
import itemDescriptions from "game/item/Items";
import ItemManager from "game/item/ItemManager";
import { DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Lambda from "../core/Lambda";
import AcquireItem from "../acquire/item/AcquireItem";
import AcquireItemWithRecipe from "../acquire/item/AcquireItemWithRecipe";
import AcquireItemFromDismantle from "../acquire/item/AcquireItemFromDismantle";
import HuntCreatures from "../other/creature/HuntCreatures";
import AcquireItemByGroup from "../acquire/item/AcquireItemByGroup";
import Restart from "../core/Restart";
import AcquireBuildMoveToDoodad from "../acquire/doodad/AcquireBuildMoveToDoodad";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import UseItem from "../other/item/UseItem";
import StokeFire from "../other/doodad/StokeFire";
import StartWaterStillDesalination from "../other/doodad/StartWaterStillDesalination";
import GatherWaterFromStill from "../gather/GatherWaterFromStill";
import AcquireWaterContainer from "../acquire/item/specific/AcquireWaterContainer";
import TameCreatures from "../other/creature/TameCreatures";
import EquipItem from "../other/item/EquipItem";
import UnequipItem from "../other/item/UnequipItem";
import SailToCivilization from "../utility/SailToCivilization";

export default class CompleteQuestRequirement extends Objective {

    constructor(private readonly quest: QuestInstance, private readonly requirement: IQuestRequirement) {
        super();
    }

    public getIdentifier(): string {
        return `CompleteQuestRequirement:${this.quest.id}:${this.requirement.type}:${QuestRequirementType[this.requirement.type]}`;
    }

    public getStatus(): string | undefined {
        return `Completing requirement for quest ${this.quest.getTitle()?.getString()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (Enums.isModded(QuestRequirementType, this.requirement.type)) {
            return this.getObjectivesForModdedQuestRequirement(context, QuestRequirementType[this.requirement.type]);

        }

        return this.getObjectivesForQuestRequirement(context, this.requirement.type);
    }

    private getObjectivesForQuestRequirement(context: Context, requirementType: QuestRequirementType): ObjectiveExecutionResult {
        switch (requirementType) {

            case QuestRequirementType.SailToCivilization:
                return new SailToCivilization();

            case QuestRequirementType.CollectItem: {
                const objectivePipelines: IObjective[][] = [];

                const [itemTypesOrGroups, amount] = this.requirement.options as [Array<ItemType | ItemTypeGroup>, number];

                for (const itemTypeOrGroup of itemTypesOrGroups) {
                    const pipelines: IObjective[] = [];

                    for (let i = 0; i < amount; i++) {
                        pipelines.push(ItemManager.isGroup(itemTypeOrGroup) ? new AcquireItemByGroup(itemTypeOrGroup) : new AcquireItem(itemTypeOrGroup));
                    }

                    objectivePipelines.push(pipelines);
                }

                return objectivePipelines;
            }

            case QuestRequirementType.KillCreature: {
                const [creatureType, _amount] = this.requirement.options as [CreatureType, number];

                const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreature", { type: creatureType, top: 10 });

                return new HuntCreatures(creatures);
            }

            case QuestRequirementType.KillCreatures: {
                const [_amount] = this.requirement.options as [number];

                const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreatures", { top: 10 });

                return new HuntCreatures(creatures);
            }

            case QuestRequirementType.LearnSkill:
                return ObjectiveResult.Impossible;

            case QuestRequirementType.LearnSkills:
                return ObjectiveResult.Impossible;

            case QuestRequirementType.LearnAnySkill:
                return ObjectiveResult.Impossible;

            case QuestRequirementType.Equip: {
                const objectivePipelines: IObjective[][] = [];

                const [matchingEquipTypes, matchingItemTypeGroups] = this.requirement.options as [EquipType[], ItemTypeGroup[]];

                for (const itemTypeGroup of matchingItemTypeGroups) {
                    const itemTypes = context.island.items.getGroupItems(itemTypeGroup);
                    for (const itemType of itemTypes) {
                        const equipType = itemDescriptions[itemType]?.equip;
                        if (equipType === undefined || !matchingEquipTypes.includes(equipType)) {
                            continue;
                        }

                        const matchingItem = context.utilities.item.getItemInInventory(context, itemType);
                        if (matchingItem !== undefined) {
                            objectivePipelines.push(matchingItem.isEquipped() ?
                                [new UnequipItem(matchingItem), new EquipItem(equipType, matchingItem)] :
                                [new EquipItem(equipType, matchingItem)]);

                        } else {
                            objectivePipelines.push([new AcquireItem(itemType), new EquipItem(equipType)]);
                        }
                    }
                }

                return ObjectiveResult.Restart;
            }

            case QuestRequirementType.Craft: {
                const objectivePipelines: IObjective[][] = [];

                const [itemTypesOrGroups, _amount] = this.requirement.options as [Array<ItemType | ItemTypeGroup>, number];

                for (const itemTypeOrGroup of itemTypesOrGroups) {
                    let itemTypes: Set<ItemType>;

                    if (ItemManager.isGroup(itemTypeOrGroup)) {
                        itemTypes = context.island.items.getGroupItems(itemTypeOrGroup);

                    } else {
                        itemTypes = new Set([itemTypeOrGroup]);
                    }

                    for (const itemType of itemTypes) {
                        const recipe = itemDescriptions[itemType]?.recipe;
                        if (recipe === undefined) {
                            continue;
                        }

                        objectivePipelines.push([new AcquireItemWithRecipe(itemType, recipe), new Restart()]);
                    }
                }

                return objectivePipelines;
            }

            case QuestRequirementType.Dismantle: {
                const objectivePipelines: IObjective[][] = [];

                const [itemTypes, amount] = this.requirement.options as [ItemType[], number];

                for (const itemType of itemTypes) {
                    const dismantle = itemDescriptions[itemType]?.dismantle;
                    if (dismantle === undefined) {
                        return ObjectiveResult.Impossible;
                    }

                    const pipelines: IObjective[] = [];

                    for (let i = 0; i < amount; i++) {
                        pipelines.push(new AcquireItemFromDismantle(dismantle.items[0].type, [itemType]));
                    }

                    objectivePipelines.push(pipelines);
                }

                return objectivePipelines;
            }

            case QuestRequirementType.Build:
                const [itemType] = this.requirement.options as [ItemType];

                const doodadType = itemDescriptions[itemType]?.onUse?.[ActionType.Build];
                if (doodadType === undefined) {
                    return ObjectiveResult.Impossible;
                }

                return new AcquireBuildMoveToDoodad(typeof (doodadType) === "object" ? doodadType[0] : doodadType, {
                    ignoreExistingDoodads: true,
                    disableMoveTo: true,
                });

            case QuestRequirementType.TameCreature: {
                const [creatureType, _amount] = this.requirement.options as [CreatureType, number];

                // look for non-hostile creatures first
                let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", { type: creatureType, hostile: false, top: 10 });
                if (creatures.length === 0) {
                    creatures = context.utilities.object.findTamableCreatures(context, "Tame2", { type: creatureType, hostile: true, top: 10 });
                    if (creatures.length === 0) {
                        return ObjectiveResult.Impossible;
                    }
                }

                return new TameCreatures(creatures);
            }

            case QuestRequirementType.TameCreatures: {
                // look for non-hostile creatures first
                let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", { hostile: false, top: 10 });
                if (creatures.length === 0) {
                    creatures = context.utilities.object.findTamableCreatures(context, "Tame2", { hostile: true, top: 10 });
                    if (creatures.length === 0) {
                        return ObjectiveResult.Impossible;
                    }
                }

                return new TameCreatures(creatures);
            }

            case QuestRequirementType.DiscoverTreasure:
                return ObjectiveResult.Impossible;

            // commented out so that typescript errors when TARS is missing a requirement
            // default:
            //     this.log.warn(`Unknown quest requirement: ${this.quest.getTitle()}, ${QuestRequirementType[this.requirement.type]} (${this.requirement.type})`);
            //     return ObjectiveResult.Restart;
        }
    }

    private getObjectivesForModdedQuestRequirement(context: Context, requirementTypeString: string): ObjectiveExecutionResult {
        switch (requirementTypeString) {

            case "ModStarterQuestQuickslot":
                return new Lambda(async () => {
                    let itemId: number | undefined;

                    for (const item of context.human.inventory.containedItems) {
                        if (item.quickSlot === undefined) {
                            itemId = item.id;
                            break;
                        }
                    }

                    if (itemId === undefined) {
                        return ObjectiveResult.Impossible;
                    }

                    return oldui.screenInGame?.addItemToFreeQuickSlot(itemId) ? ObjectiveResult.Complete : ObjectiveResult.Impossible;
                });

            case "ModStarterQuestChangeHand":
                return new Lambda(async (context) => {
                    const player = context.human.asPlayer;
                    if (player) {
                        game.updateOption(player, "leftHand", !context.human.options.leftHand);
                    }

                    return ObjectiveResult.Complete;
                });

            case "ModStarterQuestLightCampfire":
                const objectives: IObjective[] = [
                    new AcquireBuildMoveToDoodad(DoodadTypeGroup.LitCampfire),
                ];

                if (context.inventory.fireStarter === undefined) {
                    objectives.push(new AcquireItemForAction(ActionType.StartFire));
                }

                objectives.push(new UseItem(ActionType.StartFire, context.inventory.fireStarter));

                return objectives;

            case "ModStarterQuestStokeCampfire":
                return [
                    new AcquireBuildMoveToDoodad(DoodadTypeGroup.LitCampfire),
                    new StokeFire(context.base.campfire[0]),
                ];

            case "ModStarterQuestFillStill": {
                const objectivePipelines: IObjective[][] = [];

                for (const waterStill of context.base.waterStill) {
                    if (waterStill.gatherReady === undefined) {
                        objectivePipelines.push([
                            new StartWaterStillDesalination(waterStill, {
                                disableAttaching: true,
                                disableStarting: true,
                            }),
                        ]);
                    }
                }

                return objectivePipelines;
            }

            case "ModStarterQuestAttachContainer": {
                const objectivePipelines: IObjective[][] = [];

                for (const waterStill of context.base.waterStill) {
                    if (waterStill.stillContainer === undefined) {
                        objectivePipelines.push([
                            new StartWaterStillDesalination(waterStill, {
                                disableStarting: true,
                            }),
                        ]);
                    }
                }

                return objectivePipelines;
            }

            case "ModStarterQuestLightWaterStill": {
                const objectivePipelines: IObjective[][] = [];

                for (const waterStill of context.base.waterStill) {
                    if (!waterStill.description()?.providesFire) {
                        objectivePipelines.push([
                            new StartWaterStillDesalination(waterStill, { forceStoke: true }),
                        ]);
                    }
                }

                return objectivePipelines;
            }

            case "ModStarterQuestStokeWaterStill": {
                const objectivePipelines: IObjective[][] = [];

                for (const waterStill of context.base.waterStill) {
                    if (waterStill.description()?.providesFire) {
                        objectivePipelines.push([
                            new StartWaterStillDesalination(waterStill, { forceStoke: true }),
                        ]);
                    }
                }

                return objectivePipelines;
            }

            case "ModStarterQuestGatherFromWaterStill": {
                const objectivePipelines: IObjective[][] = [];

                if (context.inventory.waterContainer === undefined) {
                    objectivePipelines.push([new AcquireWaterContainer(), new Restart()]);

                } else {
                    for (const waterStill of context.base.waterStill) {
                        objectivePipelines.push([new GatherWaterFromStill(waterStill, context.inventory.waterContainer[0], {
                            allowStartingWaterStill: true,
                            allowWaitingForWater: true,
                            onlyIdleWhenWaitingForWaterStill: true,
                        })]);
                    }
                }

                return objectivePipelines;
            }

            default:
                this.log.warn(`Unknown modded quest requirement: ${this.quest.getTitle()}, ${QuestRequirementType[this.requirement.type]}`);
                return ObjectiveResult.Restart;
        }
    }
}
