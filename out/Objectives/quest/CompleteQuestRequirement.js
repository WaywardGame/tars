define(["require", "exports", "game/entity/player/quest/requirement/IRequirement", "utilities/enum/Enums", "game/item/Items", "game/item/ItemManager", "game/doodad/IDoodad", "game/entity/action/IAction", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Lambda", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemWithRecipe", "../acquire/item/AcquireItemFromDismantle", "../other/creature/HuntCreatures", "../acquire/item/AcquireItemByGroup", "../core/Restart", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/item/AcquireItemForAction", "../other/item/UseItem", "../other/doodad/StokeFire", "../other/doodad/StartWaterStillDesalination", "../gather/GatherWaterFromStill", "../acquire/item/specific/AcquireWaterContainer", "../other/creature/TameCreatures"], function (require, exports, IRequirement_1, Enums_1, Items_1, ItemManager_1, IDoodad_1, IAction_1, IObjective_1, Objective_1, Lambda_1, AcquireItem_1, AcquireItemWithRecipe_1, AcquireItemFromDismantle_1, HuntCreatures_1, AcquireItemByGroup_1, Restart_1, AcquireBuildMoveToDoodad_1, AcquireItemForAction_1, UseItem_1, StokeFire_1, StartWaterStillDesalination_1, GatherWaterFromStill_1, AcquireWaterContainer_1, TameCreatures_1) {
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
            var _a, _b, _c, _d, _e, _f;
            const objectivePipelines = [];
            if (Enums_1.default.isModded(IRequirement_1.QuestRequirementType, this.requirement.type)) {
                switch (IRequirement_1.QuestRequirementType[this.requirement.type]) {
                    case "ModStarterQuestQuickslot":
                        objectivePipelines.push([new Lambda_1.default(async () => {
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
                            })]);
                        break;
                    case "ModStarterQuestChangeHand":
                        objectivePipelines.push([new Lambda_1.default(async (context) => {
                                game.updateOption(context.player, "leftHand", !context.player.options.leftHand);
                                return IObjective_1.ObjectiveResult.Complete;
                            })]);
                        break;
                    case "ModStarterQuestLightCampfire":
                        const objectives = [
                            new AcquireBuildMoveToDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitCampfire),
                        ];
                        if (context.inventory.fireStarter === undefined) {
                            objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire));
                        }
                        objectives.push(new UseItem_1.default(IAction_1.ActionType.StartFire, context.inventory.fireStarter));
                        objectivePipelines.push(objectives);
                        break;
                    case "ModStarterQuestStokeCampfire":
                        objectivePipelines.push([
                            new AcquireBuildMoveToDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitCampfire),
                            new StokeFire_1.default(context.base.campfire[0]),
                        ]);
                        break;
                    case "ModStarterQuestFillStill":
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
                        break;
                    case "ModStarterQuestAttachContainer":
                        for (const waterStill of context.base.waterStill) {
                            if (waterStill.stillContainer === undefined) {
                                objectivePipelines.push([
                                    new StartWaterStillDesalination_1.default(waterStill, {
                                        disableStarting: true,
                                    }),
                                ]);
                            }
                        }
                        break;
                    case "ModStarterQuestLightWaterStill":
                        for (const waterStill of context.base.waterStill) {
                            if (!((_a = waterStill.description()) === null || _a === void 0 ? void 0 : _a.providesFire)) {
                                objectivePipelines.push([
                                    new StartWaterStillDesalination_1.default(waterStill, { forceStoke: true }),
                                ]);
                            }
                        }
                        break;
                    case "ModStarterQuestStokeWaterStill":
                        for (const waterStill of context.base.waterStill) {
                            if ((_b = waterStill.description()) === null || _b === void 0 ? void 0 : _b.providesFire) {
                                objectivePipelines.push([
                                    new StartWaterStillDesalination_1.default(waterStill, { forceStoke: true }),
                                ]);
                            }
                        }
                        break;
                    case "ModStarterQuestGatherFromWaterStill":
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
                        break;
                    default:
                        this.log.warn(`Unknown modded quest requirement: ${this.quest.getTitle()}, ${IRequirement_1.QuestRequirementType[this.requirement.type]}`);
                        return IObjective_1.ObjectiveResult.Restart;
                }
            }
            else {
                switch (this.requirement.type) {
                    case IRequirement_1.QuestRequirementType.CollectItem: {
                        const [itemTypesOrGroups, amount] = this.requirement.options;
                        for (const itemTypeOrGroup of itemTypesOrGroups) {
                            const pipelines = [];
                            for (let i = 0; i < amount; i++) {
                                pipelines.push(ItemManager_1.default.isGroup(itemTypeOrGroup) ? new AcquireItemByGroup_1.default(itemTypeOrGroup) : new AcquireItem_1.default(itemTypeOrGroup));
                            }
                            objectivePipelines.push(pipelines);
                        }
                        break;
                    }
                    case IRequirement_1.QuestRequirementType.Craft: {
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
                                const recipe = (_c = Items_1.default[itemType]) === null || _c === void 0 ? void 0 : _c.recipe;
                                if (recipe === undefined) {
                                    continue;
                                }
                                objectivePipelines.push([new AcquireItemWithRecipe_1.default(itemType, recipe), new Restart_1.default()]);
                            }
                        }
                        break;
                    }
                    case IRequirement_1.QuestRequirementType.Dismantle: {
                        const [itemTypes, amount] = this.requirement.options;
                        for (const itemType of itemTypes) {
                            const dismantle = (_d = Items_1.default[itemType]) === null || _d === void 0 ? void 0 : _d.dismantle;
                            if (dismantle === undefined) {
                                return IObjective_1.ObjectiveResult.Impossible;
                            }
                            const pipelines = [];
                            for (let i = 0; i < amount; i++) {
                                pipelines.push(new AcquireItemFromDismantle_1.default(dismantle.items[0].type, [itemType]));
                            }
                            objectivePipelines.push(pipelines);
                        }
                        break;
                    }
                    case IRequirement_1.QuestRequirementType.KillCreatures: {
                        const [_amount] = this.requirement.options;
                        const creatures = context.utilities.object.findHuntableCreatures(context, "KillCreatures", false, 10);
                        objectivePipelines.push([new HuntCreatures_1.default(creatures)]);
                        break;
                    }
                    case IRequirement_1.QuestRequirementType.Build:
                        const [itemType] = this.requirement.options;
                        const doodadType = (_f = (_e = Items_1.default[itemType]) === null || _e === void 0 ? void 0 : _e.onUse) === null || _f === void 0 ? void 0 : _f[IAction_1.ActionType.Build];
                        if (doodadType === undefined) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                        objectivePipelines.push([
                            new AcquireBuildMoveToDoodad_1.default(typeof (doodadType) === "object" ? doodadType[0] : doodadType, {
                                ignoreExistingDoodads: true,
                                disableMoveTo: true,
                            })
                        ]);
                        break;
                    case IRequirement_1.QuestRequirementType.TameCreatures: {
                        let creatures = context.utilities.object.findTamableCreatures(context, "Tame1", false, 10);
                        if (creatures.length === 0) {
                            creatures = context.utilities.object.findTamableCreatures(context, "Tame2", true, 10);
                            if (creatures.length === 0) {
                                return IObjective_1.ObjectiveResult.Impossible;
                            }
                        }
                        objectivePipelines.push([new TameCreatures_1.default(creatures)]);
                        break;
                    }
                    default:
                        this.log.warn(`Unknown quest requirement: ${this.quest.getTitle()}, ${IRequirement_1.QuestRequirementType[this.requirement.type]} (${this.requirement.type})`);
                        return IObjective_1.ObjectiveResult.Restart;
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = CompleteQuestRequirement;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvcXVlc3QvQ29tcGxldGVRdWVzdFJlcXVpcmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQThCQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixLQUFvQixFQUFtQixXQUE4QjtZQUM5RixLQUFLLEVBQUUsQ0FBQztZQURpQixVQUFLLEdBQUwsS0FBSyxDQUFlO1lBQW1CLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUVsRyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLDRCQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDL0gsQ0FBQztRQUVNLFNBQVM7O1lBQ1osT0FBTyxvQ0FBb0MsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSwwQ0FBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ3BGLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNqQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxlQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFvQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdELFFBQVEsbUNBQW9CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFFakQsS0FBSywwQkFBMEI7d0JBQzNCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTs7Z0NBQzNDLElBQUksTUFBMEIsQ0FBQztnQ0FFL0IsS0FBSyxNQUFNLElBQUksSUFBSSxP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