/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/actions/StartFire", "game/entity/action/IAction", "game/entity/player/quest/requirement/IRequirement", "game/item/ItemDescriptions", "game/item/ItemManager", "utilities/enum/Enums", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/item/AcquireInventoryItem", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemByGroup", "../acquire/item/AcquireItemFromDismantle", "../acquire/item/AcquireItemWithRecipe", "../acquire/item/specific/AcquireWater", "../core/Lambda", "../core/Restart", "../other/creature/HuntCreatures", "../other/creature/TameCreatures", "../other/doodad/StartWaterStillDesalination", "../other/doodad/StokeFire", "../other/item/EquipItem", "../other/item/UnequipItem", "../other/item/UseItem", "../utility/SailToCivilization"], function (require, exports, IDoodad_1, StartFire_1, IAction_1, IRequirement_1, ItemDescriptions_1, ItemManager_1, Enums_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireInventoryItem_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1, AcquireWater_1, Lambda_1, Restart_1, HuntCreatures_1, TameCreatures_1, StartWaterStillDesalination_1, StokeFire_1, EquipItem_1, UnequipItem_1, UseItem_1, SailToCivilization_1) {
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
                    const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreatures", { skipWaterCreatures: true });
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
                            const equipType = ItemDescriptions_1.itemDescriptions[itemType]?.equip;
                            if (equipType === undefined || !matchingEquipTypes.includes(equipType)) {
                                continue;
                            }
                            const matchingItem = context.utilities.item.getItemInInventory(context, itemType);
                            if (matchingItem !== undefined) {
                                objectivePipelines.push(matchingItem.isEquipped(true) ?
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
                            const recipe = ItemDescriptions_1.itemDescriptions[itemType]?.recipe;
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
                        const dismantle = ItemDescriptions_1.itemDescriptions[itemType]?.dismantle;
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
                    const buildInfo = ItemDescriptions_1.itemDescriptions[itemType]?.onUse?.[IAction_1.ActionType.Build];
                    if (buildInfo === undefined) {
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    return new AcquireBuildMoveToDoodad_1.default(buildInfo.type, {
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
                case "ModStarterQuestActionSlots":
                    return new Lambda_1.default(async () => {
                        let itemToSlot;
                        for (const item of context.utilities.item.getItemsInInventory(context)) {
                            if ((gameScreen?.actionBar?.getSlottedIn(item)?.size ?? 0) === 0) {
                                itemToSlot = item;
                                break;
                            }
                        }
                        if (itemToSlot === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        const slots = gameScreen?.actionBar?.getSlots();
                        if (slots) {
                            console.log(itemToSlot);
                            Array.from(slots)[0].equipItem(itemToSlot, false);
                            return IObjective_1.ObjectiveResult.Complete;
                        }
                        return IObjective_1.ObjectiveResult.Impossible;
                    }).setStatus(this);
                case "ModStarterQuestLightCampfire":
                    const objectives = [
                        new AcquireBuildMoveToDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitCampfire),
                        new AcquireInventoryItem_1.default("fireStarter"),
                        new UseItem_1.default(StartFire_1.default),
                    ];
                    objectives.push();
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
                        if (!waterStill.description?.providesFire) {
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
                        if (waterStill.description?.providesFire) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill, { forceStoke: true }),
                            ]);
                        }
                    }
                    return objectivePipelines;
                }
                case "ModStarterQuestGatherFromWaterStill": {
                    const objectivePipelines = [];
                    const objectives = [];
                    objectives.push(new AcquireWater_1.default({
                        disallowCreatureSearch: true,
                        disallowDoodadSearch: true,
                        disallowTerrain: true,
                        disallowWell: true,
                        allowStartingWaterStill: true,
                        allowWaitingForWater: true,
                        onlyIdleWhenWaitingForWaterStill: true,
                    }));
                    objectivePipelines.push(objectives);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvcXVlc3QvQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQXNDSCxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixLQUFvQixFQUFtQixXQUE4QjtZQUM5RixLQUFLLEVBQUUsQ0FBQztZQURpQixVQUFLLEdBQUwsS0FBSyxDQUFlO1lBQW1CLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUVsRyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLDRCQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDL0gsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLG9DQUFvQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDcEYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxlQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFvQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sSUFBSSxDQUFDLHNDQUFzQyxDQUFDLE9BQU8sRUFBRSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFNUc7WUFFRCxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRU8sZ0NBQWdDLENBQUMsT0FBZ0IsRUFBRSxl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