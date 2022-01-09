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
            var _a;
            return `Completing requirement for quest ${(_a = this.quest.getTitle()) === null || _a === void 0 ? void 0 : _a.getString()}`;
        }
        async execute(context) {
            if (Enums_1.default.isModded(IRequirement_1.QuestRequirementType, this.requirement.type)) {
                return this.getObjectivesForModdedQuestRequirement(context, IRequirement_1.QuestRequirementType[this.requirement.type]);
            }
            return this.getObjectivesForQuestRequirement(context, this.requirement.type);
        }
        getObjectivesForQuestRequirement(context, requirementType) {
            var _a, _b, _c, _d, _e;
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
                            const equipType = (_a = Items_1.default[itemType]) === null || _a === void 0 ? void 0 : _a.equip;
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
                            const recipe = (_b = Items_1.default[itemType]) === null || _b === void 0 ? void 0 : _b.recipe;
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
                        const dismantle = (_c = Items_1.default[itemType]) === null || _c === void 0 ? void 0 : _c.dismantle;
                        if (dismantle === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        const pipelines = [];
                        for (let i = 0; i < amount; i++) {
                            pipelines.push(new AcquireItemFromDismantle_1.default(dismantle.items[0].type, [itemType]));
                        }
                        objectivePipelines.push(pipelines);
                    }
                    return objectivePipelines;
                }
                case IRequirement_1.QuestRequirementType.Build:
                    const [itemType] = this.requirement.options;
                    const doodadType = (_e = (_d = Items_1.default[itemType]) === null || _d === void 0 ? void 0 : _d.onUse) === null || _e === void 0 ? void 0 : _e[IAction_1.ActionType.Build];
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
            var _a, _b;
            switch (requirementTypeString) {
                case "ModStarterQuestQuickslot":
                    return new Lambda_1.default(async () => {
                        var _a;
                        let itemId;
                        for (const item of context.player.inventory.containedItems) {
                            if (item.quickSlot === undefined) {
                                itemId = item.id;
                                break;
                            }
                        }
                        if (itemId === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        return ((_a = oldui.screenInGame) === null || _a === void 0 ? void 0 : _a.addItemToFreeQuickSlot(itemId)) ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Impossible;
                    });
                case "ModStarterQuestChangeHand":
                    return new Lambda_1.default(async (context) => {
                        game.updateOption(context.player, "leftHand", !context.player.options.leftHand);
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
                        if (!((_a = waterStill.description()) === null || _a === void 0 ? void 0 : _a.providesFire)) {
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
                        if ((_b = waterStill.description()) === null || _b === void 0 ? void 0 : _b.providesFire) {
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
                                    allowWaitingForWaterStill: true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvcXVlc3QvQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW1DQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixLQUFvQixFQUFtQixXQUE4QjtZQUM5RixLQUFLLEVBQUUsQ0FBQztZQURpQixVQUFLLEdBQUwsS0FBSyxDQUFlO1lBQW1CLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUVsRyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLDRCQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDL0gsQ0FBQztRQUVNLFNBQVM7O1lBQ1osT0FBTyxvQ0FBb0MsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSwwQ0FBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ3BGLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksZUFBSyxDQUFDLFFBQVEsQ0FBQyxtQ0FBb0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3RCxPQUFPLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxPQUFPLEVBQUUsbUNBQW9CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBRTVHO1lBRUQsT0FBTyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVPLGdDQUFnQyxDQUFDLE9BQWdCLEVBQUUsZUFBcUM7O1lBQzVG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