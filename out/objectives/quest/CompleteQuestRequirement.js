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
define(["require", "exports", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/actions/StartFire", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/player/quest/requirement/IRequirement", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/game/item/ItemManager", "@wayward/game/utilities/enum/Enums", "@wayward/game/ui/screen/screens/game/static/actions/IActionBar", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/item/AcquireInventoryItem", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemByGroup", "../acquire/item/AcquireItemFromDismantle", "../acquire/item/AcquireItemWithRecipe", "../acquire/item/specific/AcquireWater", "../core/Lambda", "../core/Restart", "../other/creature/HuntCreatures", "../other/creature/TameCreatures", "../other/doodad/StokeFire", "../other/doodad/waterSource/StartDripStone", "../other/item/EquipItem", "../other/item/UnequipItem", "../other/item/UseItem", "../utility/SailToCivilization"], function (require, exports, IDoodad_1, StartFire_1, IAction_1, IRequirement_1, ItemDescriptions_1, ItemManager_1, Enums_1, IActionBar_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireInventoryItem_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1, AcquireWater_1, Lambda_1, Restart_1, HuntCreatures_1, TameCreatures_1, StokeFire_1, StartDripStone_1, EquipItem_1, UnequipItem_1, UseItem_1, SailToCivilization_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvcXVlc3QvQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQXVDSCxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUU5RCxZQUE2QixLQUFvQixFQUFtQixXQUE4QjtZQUNqRyxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFlO1lBQW1CLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUVsRyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDRCQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDNUgsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLG9DQUFvQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDakYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxlQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFvQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDakUsT0FBTyxJQUFJLENBQUMsc0NBQXNDLENBQUMsT0FBTyxFQUFFLG1DQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTVILENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RSxDQUFD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