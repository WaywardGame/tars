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
define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/actions/StartFire", "game/entity/action/IAction", "game/entity/player/quest/requirement/IRequirement", "game/item/ItemDescriptions", "game/item/ItemManager", "utilities/enum/Enums", "ui/screen/screens/game/static/actions/IActionBar", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/item/AcquireInventoryItem", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemByGroup", "../acquire/item/AcquireItemFromDismantle", "../acquire/item/AcquireItemWithRecipe", "../acquire/item/specific/AcquireWater", "../core/Lambda", "../core/Restart", "../other/creature/HuntCreatures", "../other/creature/TameCreatures", "../other/doodad/StokeFire", "../other/doodad/waterSource/StartDripStone", "../other/item/EquipItem", "../other/item/UnequipItem", "../other/item/UseItem", "../utility/SailToCivilization"], function (require, exports, IDoodad_1, StartFire_1, IAction_1, IRequirement_1, ItemDescriptions_1, ItemManager_1, Enums_1, IActionBar_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireInventoryItem_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1, AcquireWater_1, Lambda_1, Restart_1, HuntCreatures_1, TameCreatures_1, StokeFire_1, StartDripStone_1, EquipItem_1, UnequipItem_1, UseItem_1, SailToCivilization_1) {
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
                return this.getObjectivesForModdedQuestRequirement(context, IRequirement_1.QuestRequirementType[this.requirement.type], this.requirement);
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
        getObjectivesForModdedQuestRequirement(context, requirementTypeString, requirement) {
            switch (requirementTypeString) {
                case "ModStarterQuestActionSlots":
                    return new Lambda_1.default(async () => {
                        const slots = gameScreen?.actionBar?.getSlots().toArray();
                        const slot = slots?.[0];
                        if (!slot) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        if (!requirement.options[0]) {
                            slot.slotData.actionId = `${IAction_1.ActionType.Chop}`;
                            slot.event.emit("update", undefined, undefined, IActionBar_1.ActionSlotUpdateReason.Replace);
                            return IObjective_1.ObjectiveResult.Complete;
                        }
                        let itemToSlot;
                        for (const item of context.utilities.item.getItemsInInventory(context)) {
                            if (item.description?.use && (gameScreen?.actionBar?.getSlottedIn(item)?.size ?? 0) === 0) {
                                itemToSlot = item;
                                break;
                            }
                        }
                        if (itemToSlot === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        console.log(itemToSlot);
                        slot.equipItem(itemToSlot, false);
                        if (!slot.slotData.actionId) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        return IObjective_1.ObjectiveResult.Complete;
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
                case "ModStarterQuestFillDripstone": {
                    const objectivePipelines = [];
                    for (const dripStone of context.base.dripStone) {
                        if (dripStone.gatherReady === undefined) {
                            objectivePipelines.push([
                                new StartDripStone_1.default(dripStone),
                            ]);
                        }
                    }
                    return objectivePipelines;
                }
                case "ModStarterQuestGatherFromDripstone": {
                    const objectivePipelines = [];
                    const objectives = [];
                    objectives.push(new AcquireWater_1.default({
                        disallowCreatureSearch: true,
                        disallowDoodadSearch: true,
                        disallowTerrain: true,
                        disallowWell: true,
                        allowStartingWaterSourceDoodads: true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvcXVlc3QvQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQXVDSCxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixLQUFvQixFQUFtQixXQUE4QjtZQUM5RixLQUFLLEVBQUUsQ0FBQztZQURpQixVQUFLLEdBQUwsS0FBSyxDQUFlO1lBQW1CLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUVsRyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLDRCQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDL0gsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLG9DQUFvQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDcEYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxlQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFvQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sSUFBSSxDQUFDLHNDQUFzQyxDQUFDLE9BQU8sRUFBRSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUU5SDtZQUVELE9BQU8sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFFTyxnQ0FB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