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
                    const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreature", { type: creatureType });
                    return new HuntCreatures_1.default(creatures);
                }
                case IRequirement_1.QuestRequirementType.KillCreatures: {
                    const [_amount] = this.requirement.options;
                    const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreatures");
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
                    let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", { type: creatureType, hostile: false });
                    if (creatures.length === 0) {
                        creatures = context.utilities.object.findTamableCreatures(context, "Tame2", { type: creatureType, hostile: true });
                        if (creatures.length === 0) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                    }
                    return new TameCreatures_1.default(creatures);
                }
                case IRequirement_1.QuestRequirementType.TameCreatures: {
                    let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", { hostile: false });
                    if (creatures.length === 0) {
                        creatures = context.utilities.object.findTamableCreatures(context, "Tame2", { hostile: true });
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