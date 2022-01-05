import { IQuestRequirement, QuestRequirementType } from "game/entity/player/quest/requirement/IRequirement";
import { QuestInstance } from "game/entity/player/quest/QuestManager";
import Enums from "utilities/enum/Enums";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import itemDescriptions from "game/item/Items";
import ItemManager from "game/item/ItemManager";
import { DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";

import Context from "../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Lambda from "../core/Lambda";
import AcquireItem from "../acquire/item/AcquireItem";
import AcquireItemWithRecipe from "../acquire/item/AcquireItemWithRecipe";
import AcquireItemFromDismantle from "../acquire/item/AcquireItemFromDismantle";
import HuntCreatures from "../other/creature/HuntCreatures";
import { objectUtilities } from "../../utilities/Object";
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
        const objectivePipelines: IObjective[][] = [];

        if (Enums.isModded(QuestRequirementType, this.requirement.type)) {
            switch (QuestRequirementType[this.requirement.type]) {

                case "ModStarterQuestQuickslot":
                    objectivePipelines.push([new Lambda(async () => {
                        let itemId: number | undefined;

                        for (const item of context.player.inventory.containedItems) {
                            if (item.quickSlot === undefined) {
                                itemId = item.id;
                                break;
                            }
                        }

                        if (itemId === undefined) {
                            return ObjectiveResult.Impossible;
                        }

                        return oldui.screenInGame?.addItemToFreeQuickSlot(itemId) ? ObjectiveResult.Complete : ObjectiveResult.Impossible;
                    })]);

                    break;

                case "ModStarterQuestChangeHand":
                    objectivePipelines.push([new Lambda(async (context) => {
                        game.updateOption(context.player, "leftHand", !context.player.options.leftHand);
                        return ObjectiveResult.Complete;
                    })]);

                    break;

                case "ModStarterQuestLightCampfire":
                    const objectives: IObjective[] = [
                        new AcquireBuildMoveToDoodad(DoodadTypeGroup.LitCampfire),
                    ];

                    if (context.inventory.fireStarter === undefined) {
                        objectives.push(new AcquireItemForAction(ActionType.StartFire));
                    }

                    objectives.push(new UseItem(ActionType.StartFire, context.inventory.fireStarter));

                    objectivePipelines.push(objectives);

                    break;

                case "ModStarterQuestStokeCampfire":
                    objectivePipelines.push([
                        new AcquireBuildMoveToDoodad(DoodadTypeGroup.LitCampfire),
                        new StokeFire(context.base.campfire[0]),
                    ]);

                    break;

                case "ModStarterQuestFillStill":
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

                    break;

                case "ModStarterQuestAttachContainer":
                    for (const waterStill of context.base.waterStill) {
                        if (waterStill.stillContainer === undefined) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination(waterStill, {
                                    disableStarting: true,
                                }),
                            ]);
                        }
                    }

                    break;

                case "ModStarterQuestLightWaterStill":
                    for (const waterStill of context.base.waterStill) {
                        if (!waterStill.description()?.providesFire) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination(waterStill, { forceStoke: true }),
                            ]);
                        }
                    }

                    break;

                case "ModStarterQuestStokeWaterStill":
                    for (const waterStill of context.base.waterStill) {
                        if (waterStill.description()?.providesFire) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination(waterStill, { forceStoke: true }),
                            ]);
                        }
                    }

                    break;

                case "ModStarterQuestGatherFromWaterStill":
                    if (context.inventory.waterContainer === undefined) {
                        objectivePipelines.push([new AcquireWaterContainer(), new Restart()]);

                    } else {
                        for (const waterStill of context.base.waterStill) {
                            objectivePipelines.push([new GatherWaterFromStill(waterStill, context.inventory.waterContainer[0], {
                                allowStartingWaterStill: true,
                                allowWaitingForWaterStill: true,
                                onlyIdleWhenWaitingForWaterStill: true,
                            })]);
                        }
                    }

                    break;

                default:
                    this.log.warn(`Unknown modded quest requirement: ${this.quest.getTitle()}, ${QuestRequirementType[this.requirement.type]}`);
                    return ObjectiveResult.Restart;
            }

        } else {
            switch (this.requirement.type) {

                case QuestRequirementType.CollectItem: {
                    const [itemTypesOrGroups, amount] = this.requirement.options as [Array<ItemType | ItemTypeGroup>, number];

                    for (const itemTypeOrGroup of itemTypesOrGroups) {
                        const pipelines: IObjective[] = [];

                        for (let i = 0; i < amount; i++) {
                            pipelines.push(ItemManager.isGroup(itemTypeOrGroup) ? new AcquireItemByGroup(itemTypeOrGroup) : new AcquireItem(itemTypeOrGroup));
                        }

                        objectivePipelines.push(pipelines);
                    }

                    break;
                }

                case QuestRequirementType.Craft: {
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

                    break;
                }

                case QuestRequirementType.Dismantle: {
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

                    break;
                }

                case QuestRequirementType.KillCreatures: {
                    const [_amount] = this.requirement.options as [number];

                    const creatures = objectUtilities.findHuntableCreatures(context, "KillCreatures", false, 10);

                    objectivePipelines.push([new HuntCreatures(creatures)]);

                    break;
                }

                case QuestRequirementType.Build:
                    const [itemType] = this.requirement.options as [ItemType];

                    const doodadType = itemDescriptions[itemType]?.onUse?.[ActionType.Build];
                    if (doodadType === undefined) {
                        return ObjectiveResult.Impossible;
                    }

                    objectivePipelines.push([
                        new AcquireBuildMoveToDoodad(typeof (doodadType) === "object" ? doodadType[0] : doodadType, {
                            ignoreExistingDoodads: true,
                            disableMoveTo: true,
                        })
                    ]);

                    break;

                case QuestRequirementType.TameCreatures: {
                    // look for non-hostile creatures first
                    let creatures = objectUtilities.findTamableCreatures(context, "Tame1", false, 10);
                    if (creatures.length === 0) {
                        creatures = objectUtilities.findTamableCreatures(context, "Tame2", true, 10);
                        if (creatures.length === 0) {
                            return ObjectiveResult.Impossible;
                        }
                    }

                    objectivePipelines.push([new TameCreatures(creatures)]);

                    break;
                }

                default:
                    this.log.warn(`Unknown quest requirement: ${this.quest.getTitle()}, ${QuestRequirementType[this.requirement.type]} (${this.requirement.type})`);
                    return ObjectiveResult.Restart;
            }
        }

        return objectivePipelines;
    }

}
