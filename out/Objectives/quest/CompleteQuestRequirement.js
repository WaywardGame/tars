define(["require", "exports", "game/entity/player/quest/requirement/IRequirement", "utilities/enum/Enums", "game/item/Items", "game/item/ItemManager", "game/doodad/IDoodad", "game/entity/action/IAction", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Lambda", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemWithRecipe", "../acquire/item/AcquireItemFromDismantle", "../other/creature/HuntCreatures", "../acquire/item/AcquireItemByGroup", "../core/Restart", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/item/AcquireItemForAction", "../other/item/UseItem", "../other/doodad/StokeFire", "../other/doodad/StartWaterStillDesalination", "../gather/GatherWaterFromStill", "../acquire/item/specific/AcquireWaterContainer", "../other/creature/TameCreatures", "../other/item/EquipItem", "../other/item/UnequipItem", "../utility/SailToCivilization"], function (require, exports, IRequirement_1, Enums_1, Items_1, ItemManager_1, IDoodad_1, IAction_1, IObjective_1, Objective_1, Lambda_1, AcquireItem_1, AcquireItemWithRecipe_1, AcquireItemFromDismantle_1, HuntCreatures_1, AcquireItemByGroup_1, Restart_1, AcquireBuildMoveToDoodad_1, AcquireItemForAction_1, UseItem_1, StokeFire_1, StartWaterStillDesalination_1, GatherWaterFromStill_1, AcquireWaterContainer_1, TameCreatures_1, EquipItem_1, UnequipItem_1, SailToCivilization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CompleteQuestRequirement extends Objective_1.default {
        constructor(quest, requirement) {
            super();
            this.quest = quest;
            this.requirement = requirement;
        }
        getIdentifier() {
            return `CompleteQuestRequirement:${this.quest.id}:${this.requirement.type}:${IRequirement_1.QuestRequirementType[this.requirement.type]}`;
        }
        getStatus() {
            return `Completing requirement for quest ${this.quest.getTitle()?.getString()}`;
        }
        async execute(context) {
            if (Enums_1.default.isModded(IRequirement_1.QuestRequirementType, this.requirement.type)) {
                return this.getObjectivesForModdedQuestRequirement(context, IRequirement_1.QuestRequirementType[this.requirement.type]);
            }
            return this.getObjectivesForQuestRequirement(context, this.requirement.type);
        }
        getObjectivesForQuestRequirement(context, requirementType) {
            switch (requirementType) {
                case IRequirement_1.QuestRequirementType.SailToCivilization:
                    return new SailToCivilization_1.default();
                case IRequirement_1.QuestRequirementType.CollectItem: {
                    const objectivePipelines = [];
                    const [itemTypesOrGroups, amount] = this.requirement.options;
                    for (const itemTypeOrGroup of itemTypesOrGroups) {
                        const pipelines = [];
                        for (let i = 0; i < amount; i++) {
                            pipelines.push(ItemManager_1.default.isGroup(itemTypeOrGroup) ? new AcquireItemByGroup_1.default(itemTypeOrGroup) : new AcquireItem_1.default(itemTypeOrGroup));
                        }
                        objectivePipelines.push(pipelines);
                    }
                    return objectivePipelines;
                }
                case IRequirement_1.QuestRequirementType.KillCreature: {
                    const [creatureType, _amount] = this.requirement.options;
                    const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreature", { type: creatureType, top: 10 });
                    return new HuntCreatures_1.default(creatures);
                }
                case IRequirement_1.QuestRequirementType.KillCreatures: {
                    const [_amount] = this.requirement.options;
                    const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreatures", { top: 10 });
                    return new HuntCreatures_1.default(creatures);
                }
                case IRequirement_1.QuestRequirementType.LearnSkill:
                    return IObjective_1.ObjectiveResult.Impossible;
                case IRequirement_1.QuestRequirementType.LearnSkills:
                    return IObjective_1.ObjectiveResult.Impossible;
                case IRequirement_1.QuestRequirementType.LearnAnySkill:
                    return IObjective_1.ObjectiveResult.Impossible;
                case IRequirement_1.QuestRequirementType.Equip: {
                    const objectivePipelines = [];
                    const [matchingEquipTypes, matchingItemTypeGroups] = this.requirement.options;
                    for (const itemTypeGroup of matchingItemTypeGroups) {
                        const itemTypes = context.island.items.getGroupItems(itemTypeGroup);
                        for (const itemType of itemTypes) {
                            const equipType = Items_1.default[itemType]?.equip;
                            if (equipType === undefined || !matchingEquipTypes.includes(equipType)) {
                                continue;
                            }
                            const matchingItem = context.utilities.item.getItemInInventory(context, itemType);
                            if (matchingItem !== undefined) {
                                objectivePipelines.push(matchingItem.isEquipped() ?
                                    [new UnequipItem_1.default(matchingItem), new EquipItem_1.default(equipType, matchingItem)] :
                                    [new EquipItem_1.default(equipType, matchingItem)]);
                            }
                            else {
                                objectivePipelines.push([new AcquireItem_1.default(itemType), new EquipItem_1.default(equipType)]);
                            }
                        }
                    }
                    return IObjective_1.ObjectiveResult.Restart;
                }
                case IRequirement_1.QuestRequirementType.Craft: {
                    const objectivePipelines = [];
                    const [itemTypesOrGroups, _amount] = this.requirement.options;
                    for (const itemTypeOrGroup of itemTypesOrGroups) {
                        let itemTypes;
                        if (ItemManager_1.default.isGroup(itemTypeOrGroup)) {
                            itemTypes = context.island.items.getGroupItems(itemTypeOrGroup);
                        }
                        else {
                            itemTypes = new Set([itemTypeOrGroup]);
                        }
                        for (const itemType of itemTypes) {
                            const recipe = Items_1.default[itemType]?.recipe;
                            if (recipe === undefined) {
                                continue;
                            }
                            objectivePipelines.push([new AcquireItemWithRecipe_1.default(itemType, recipe), new Restart_1.default()]);
                        }
                    }
                    return objectivePipelines;
                }
                case IRequirement_1.QuestRequirementType.Dismantle: {
                    const objectivePipelines = [];
                    const [itemTypes, amount] = this.requirement.options;
                    for (const itemType of itemTypes) {
                        const dismantle = Items_1.default[itemType]?.dismantle;
                        if (dismantle === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        const pipelines = [];
                        for (let i = 0; i < amount; i++) {
                            pipelines.push(new AcquireItemFromDismantle_1.default(dismantle.items[0].type, new Set([itemType])));
                        }
                        objectivePipelines.push(pipelines);
                    }
                    return objectivePipelines;
                }
                case IRequirement_1.QuestRequirementType.Build:
                    const [itemType] = this.requirement.options;
                    const doodadType = Items_1.default[itemType]?.onUse?.[IAction_1.ActionType.Build];
                    if (doodadType === undefined) {
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    return new AcquireBuildMoveToDoodad_1.default(typeof (doodadType) === "object" ? doodadType[0] : doodadType, {
                        ignoreExistingDoodads: true,
                        disableMoveTo: true,
                    });
                case IRequirement_1.QuestRequirementType.TameCreature: {
                    const [creatureType, _amount] = this.requirement.options;
                    let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", { type: creatureType, hostile: false, top: 10 });
                    if (creatures.length === 0) {
                        creatures = context.utilities.object.findTamableCreatures(context, "Tame2", { type: creatureType, hostile: true, top: 10 });
                        if (creatures.length === 0) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                    }
                    return new TameCreatures_1.default(creatures);
                }
                case IRequirement_1.QuestRequirementType.TameCreatures: {
                    let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", { hostile: false, top: 10 });
                    if (creatures.length === 0) {
                        creatures = context.utilities.object.findTamableCreatures(context, "Tame2", { hostile: true, top: 10 });
                        if (creatures.length === 0) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                    }
                    return new TameCreatures_1.default(creatures);
                }
                case IRequirement_1.QuestRequirementType.DiscoverTreasure:
                    return IObjective_1.ObjectiveResult.Impossible;
            }
        }
        getObjectivesForModdedQuestRequirement(context, requirementTypeString) {
            switch (requirementTypeString) {
                case "ModStarterQuestQuickslot":
                    return new Lambda_1.default(async () => {
                        let itemId;
                        for (const item of context.human.inventory.containedItems) {
                            if (item.quickSlot === undefined) {
                                itemId = item.id;
                                break;
                            }
                        }
                        if (itemId === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        return oldui.screenInGame?.addItemToFreeQuickSlot(itemId) ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Impossible;
                    });
                case "ModStarterQuestChangeHand":
                    return new Lambda_1.default(async (context) => {
                        const player = context.human.asPlayer;
                        if (player) {
                            game.updateOption(player, "leftHand", !context.human.options.leftHand);
                        }
                        return IObjective_1.ObjectiveResult.Complete;
                    });
                case "ModStarterQuestLightCampfire":
                    const objectives = [
                        new AcquireBuildMoveToDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitCampfire),
                    ];
                    if (context.inventory.fireStarter === undefined) {
                        objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire));
                    }
                    objectives.push(new UseItem_1.default(IAction_1.ActionType.StartFire, context.inventory.fireStarter));
                    return objectives;
                case "ModStarterQuestStokeCampfire":
                    return [
                        new AcquireBuildMoveToDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitCampfire),
                        new StokeFire_1.default(context.base.campfire[0]),
                    ];
                case "ModStarterQuestFillStill": {
                    const objectivePipelines = [];
                    for (const waterStill of context.base.waterStill) {
                        if (waterStill.gatherReady === undefined) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill, {
                                    disableAttaching: true,
                                    disableStarting: true,
                                }),
                            ]);
                        }
                    }
                    return objectivePipelines;
                }
                case "ModStarterQuestAttachContainer": {
                    const objectivePipelines = [];
                    for (const waterStill of context.base.waterStill) {
                        if (waterStill.stillContainer === undefined) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill, {
                                    disableStarting: true,
                                }),
                            ]);
                        }
                    }
                    return objectivePipelines;
                }
                case "ModStarterQuestLightWaterStill": {
                    const objectivePipelines = [];
                    for (const waterStill of context.base.waterStill) {
                        if (!waterStill.description()?.providesFire) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill, { forceStoke: true }),
                            ]);
                        }
                    }
                    return objectivePipelines;
                }
                case "ModStarterQuestStokeWaterStill": {
                    const objectivePipelines = [];
                    for (const waterStill of context.base.waterStill) {
                        if (waterStill.description()?.providesFire) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill, { forceStoke: true }),
                            ]);
                        }
                    }
                    return objectivePipelines;
                }
                case "ModStarterQuestGatherFromWaterStill": {
                    const objectivePipelines = [];
                    if (context.inventory.waterContainer === undefined) {
                        objectivePipelines.push([new AcquireWaterContainer_1.default(), new Restart_1.default()]);
                    }
                    else {
                        for (const waterStill of context.base.waterStill) {
                            objectivePipelines.push([new GatherWaterFromStill_1.default(waterStill, context.inventory.waterContainer[0], {
                                    allowStartingWaterStill: true,
                                    allowWaitingForWater: true,
                                    onlyIdleWhenWaitingForWaterStill: true,
                                })]);
                        }
                    }
                    return objectivePipelines;
                }
                default:
                    this.log.warn(`Unknown modded quest requirement: ${this.quest.getTitle()}, ${IRequirement_1.QuestRequirementType[this.requirement.type]}`);
                    return IObjective_1.ObjectiveResult.Restart;
            }
        }
    }
    exports.default = CompleteQuestRequirement;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvcXVlc3QvQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW1DQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixLQUFvQixFQUFtQixXQUE4QjtZQUM5RixLQUFLLEVBQUUsQ0FBQztZQURpQixVQUFLLEdBQUwsS0FBSyxDQUFlO1lBQW1CLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUVsRyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLDRCQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDL0gsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLG9DQUFvQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDcEYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxlQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFvQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sSUFBSSxDQUFDLHNDQUFzQyxDQUFDLE9BQU8sRUFBRSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFNUc7WUFFRCxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRU8sZ0NBQWdDLENBQUMsT0FBZ0IsRUFBRSxlQUFxQztZQUM1RixRQUFRLGVB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