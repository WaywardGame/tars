var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "creature/corpse/Corpses", "doodad/Doodads", "Enums", "item/Items", "tile/TerrainResources", "utilities/enum/Enums", "../Helpers", "../IObjective", "../Objective", "./AcquireBuildMoveToDoodad", "./AcquireBuildMoveToFire", "./AcquireItemByGroup", "./ExecuteAction", "./GatherFromChest", "./GatherFromCreature", "./GatherFromDoodad", "./GatherFromGround", "./GatherFromTerrain"], function (require, exports, Corpses_1, Doodads_1, Enums_1, Items_1, TerrainResources_1, Enums_2, Helpers, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AcquireItemByGroup_1, ExecuteAction_1, GatherFromChest_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItem extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getHashCode() {
            return `AcquireItem:${itemManager.getItemTypeGroupName(this.itemType, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                let itemDescription;
                this.log.info(`${Enums_1.ItemType[this.itemType]}`);
                itemDescription = Items_1.itemDescriptions[this.itemType];
                const objectiveSets = [
                    [new GatherFromGround_1.default(this.itemType)],
                    [new GatherFromChest_1.default(this.itemType)]
                ];
                if (!itemDescription || !itemDescription.recipe) {
                    const terrainsToGatherFrom = this.getTerrainSearch([this.itemType]);
                    if (terrainsToGatherFrom.length > 0) {
                        objectiveSets.push([new GatherFromTerrain_1.default(terrainsToGatherFrom)]);
                    }
                    const doodadsToGatherFrom = this.getDoodadSearch([this.itemType]);
                    if (doodadsToGatherFrom.length > 0) {
                        objectiveSets.push([new GatherFromDoodad_1.default(doodadsToGatherFrom)]);
                    }
                    const creaturesToGatherFrom = this.getCreatureSearch([this.itemType]);
                    if (creaturesToGatherFrom.length > 0) {
                        objectiveSets.push([new GatherFromCreature_1.default(creaturesToGatherFrom)]);
                    }
                    const itemTypesToDismantle = [];
                    for (const it of Enums_2.default.values(Enums_1.ItemType)) {
                        const description = Items_1.itemDescriptions[it];
                        if (description && description.dismantle) {
                            for (const di of description.dismantle.items) {
                                if (di[0] === this.itemType) {
                                    itemTypesToDismantle.push(it);
                                    break;
                                }
                            }
                        }
                    }
                    if (itemTypesToDismantle.length > 0) {
                        for (const it of itemTypesToDismantle) {
                            const description = Items_1.itemDescriptions[it];
                            if (!description || !description.dismantle) {
                                continue;
                            }
                            const dismantleItem = Helpers.getItemInInventory(inventory, it);
                            const hasItem = dismantleItem !== undefined;
                            let hasRequiredItem = true;
                            if (description.dismantle.required !== undefined) {
                                hasRequiredItem = itemManager.countItemsInContainerByGroup(localPlayer.inventory, description.dismantle.required) > 0;
                            }
                            if (hasItem) {
                                if (hasRequiredItem) {
                                    return new ExecuteAction_1.default(Enums_1.ActionType.Dismantle, dismantleItem);
                                }
                                else {
                                    objectiveSets.push([new AcquireItemByGroup_1.default(description.dismantle.required), new ExecuteAction_1.default(Enums_1.ActionType.Dismantle, dismantleItem)]);
                                }
                            }
                            else {
                                const terrainsToGatherDismantleItemFrom = this.getTerrainSearch([this.itemType]);
                                if (terrainsToGatherDismantleItemFrom.length > 0) {
                                    const objectiveSet = [new GatherFromTerrain_1.default(terrainsToGatherDismantleItemFrom)];
                                    if (!hasRequiredItem) {
                                        objectiveSet.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                                    }
                                    objectiveSet.push(new ExecuteAction_1.default(Enums_1.ActionType.Dismantle, dismantleItem));
                                    objectiveSets.push(objectiveSet);
                                }
                                const doodadsToGatherDismantleItemFrom = this.getDoodadSearch([it]);
                                if (doodadsToGatherDismantleItemFrom.length > 0) {
                                    const objectiveSet = [new GatherFromDoodad_1.default(doodadsToGatherDismantleItemFrom)];
                                    if (!hasRequiredItem) {
                                        objectiveSet.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                                    }
                                    objectiveSet.push(new ExecuteAction_1.default(Enums_1.ActionType.Dismantle, dismantleItem));
                                    objectiveSets.push(objectiveSet);
                                }
                                const creaturesToGatherDismantleItemFrom = this.getCreatureSearch([it]);
                                if (creaturesToGatherDismantleItemFrom.length > 0) {
                                    const objectiveSet = [new GatherFromCreature_1.default(creaturesToGatherDismantleItemFrom)];
                                    if (!hasRequiredItem) {
                                        objectiveSet.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                                    }
                                    objectiveSet.push(new ExecuteAction_1.default(Enums_1.ActionType.Dismantle, dismantleItem));
                                    objectiveSets.push(objectiveSet);
                                }
                            }
                        }
                    }
                    if (objectiveSets.length > 0) {
                        const objective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                        if (objective === undefined) {
                            if (calculateDifficulty) {
                                return IObjective_1.missionImpossible;
                            }
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                        return objective;
                    }
                    this.log.info(`Can't acquire item ${Enums_1.ItemType[this.itemType]}. Items to dismantle: ${itemTypesToDismantle.length}`);
                    if (calculateDifficulty) {
                        return IObjective_1.missionImpossible;
                    }
                    return;
                }
                const recipe = itemDescription.recipe;
                const checker = Helpers.processRecipe(inventory, recipe, true);
                const requirementsMet = checker.requirementsMet();
                const hasAdditionalRequirements = itemManager.hasAdditionalRequirements(localPlayer, this.itemType);
                if (requirementsMet && hasAdditionalRequirements.requirementsMet) {
                    if (!calculateDifficulty) {
                        Helpers.resetTargetRecipes();
                    }
                    if (localPlayer.swimming) {
                    }
                    this.log.info(`Crafting ${Enums_1.ItemType[this.itemType]}`);
                    return new ExecuteAction_1.default(Enums_1.ActionType.Craft, {
                        item: checker.itemBaseComponent,
                        itemType: this.itemType,
                        itemComponentsRequired: checker.itemComponentsRequired,
                        itemComponentsConsumed: checker.itemComponentsConsumed
                    });
                }
                else {
                    const recipeObjectives = [];
                    if (!calculateDifficulty) {
                        Helpers.addTargetRecipe(recipe);
                    }
                    const itemBase = checker.itemBaseComponent;
                    if (recipe.baseComponent !== undefined && !itemBase) {
                        this.log.info(`Need base component ${Items_1.isItemTypeGroup(recipe.baseComponent) ? Enums_1.ItemTypeGroup[recipe.baseComponent] : Enums_1.ItemType[recipe.baseComponent]}`);
                        if (Items_1.isItemTypeGroup(recipe.baseComponent)) {
                            recipeObjectives.push(new AcquireItemByGroup_1.default(recipe.baseComponent));
                        }
                        else {
                            recipeObjectives.push(new AcquireItem(recipe.baseComponent));
                        }
                    }
                    const requires = recipe.components;
                    for (let i = 0; i < requires.length; i++) {
                        const missingAmount = checker.amountNeededForComponent(i);
                        if (missingAmount > 0) {
                            const componentType = requires[i].type;
                            if (typeof (componentType) === "object") {
                                this.log.warn("Weird component type", componentType);
                                continue;
                            }
                            this.log.info(`Need component. ${Items_1.isItemTypeGroup(componentType) ? Enums_1.ItemTypeGroup[componentType] : Enums_1.ItemType[componentType]}`);
                            for (let j = 0; j < missingAmount; j++) {
                                if (Items_1.isItemTypeGroup(componentType)) {
                                    recipeObjectives.push(new AcquireItemByGroup_1.default(componentType));
                                }
                                else {
                                    recipeObjectives.push(new AcquireItem(componentType));
                                }
                            }
                        }
                    }
                    if (!hasAdditionalRequirements.requirementsMet) {
                        if (recipe.requiresFire) {
                            this.log.info("Recipe requires fire");
                            recipeObjectives.push(new AcquireBuildMoveToFire_1.default());
                        }
                        else if (recipe.requiredDoodad !== undefined) {
                            this.log.info("Recipe requires doodad");
                            recipeObjectives.push(new AcquireBuildMoveToDoodad_1.default(recipe.requiredDoodad));
                        }
                        else if (calculateDifficulty) {
                            return IObjective_1.missionImpossible;
                        }
                    }
                    objectiveSets.push(recipeObjectives);
                }
                const easyObjective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                if (easyObjective !== undefined) {
                    return easyObjective;
                }
                this.log.info(`Can't aquire item ${Enums_1.ItemType[this.itemType]}`);
                if (calculateDifficulty) {
                    return IObjective_1.missionImpossible;
                }
            });
        }
        getTerrainSearch(itemTypes) {
            const search = [];
            for (const it of itemTypes) {
                for (const tt of Enums_2.default.values(Enums_1.TerrainType)) {
                    const resource = TerrainResources_1.default[tt];
                    if (resource) {
                        let total = 0;
                        let chance = 0;
                        for (const ri of resource.items) {
                            if (!ri.chance) {
                                continue;
                            }
                            total += ri.chance;
                            if (ri.type === it) {
                                chance += ri.chance;
                            }
                        }
                        if (resource.defaultItem === it) {
                            chance += 100 - total;
                        }
                        if (chance > 0) {
                            search.push({
                                type: tt,
                                itemType: it,
                                chance: chance
                            });
                        }
                    }
                }
            }
            return search;
        }
        getDoodadSearch(itemTypes) {
            const search = [];
            for (const itemType of itemTypes) {
                for (const doodadType of Enums_2.default.values(Enums_1.DoodadType)) {
                    const doodadDescription = Doodads_1.default[doodadType];
                    if (doodadDescription) {
                        if (doodadDescription.gather) {
                            for (const key of Object.keys(doodadDescription.gather)) {
                                const growingStage = parseInt(key, 10);
                                const resourceItems = doodadDescription.gather[growingStage];
                                if (resourceItems) {
                                    for (const resourceItem of resourceItems) {
                                        if (resourceItem.type === itemType) {
                                            search.push({
                                                type: doodadType,
                                                growingStage: growingStage,
                                                itemType: itemType,
                                                action: Enums_1.ActionType.Gather
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        if (doodadDescription.harvest) {
                            for (const key of Object.keys(doodadDescription.harvest)) {
                                const growingStage = parseInt(key, 10);
                                const resourceItems = doodadDescription.harvest[growingStage];
                                if (resourceItems) {
                                    for (const resourceItem of resourceItems) {
                                        if (resourceItem.type === itemType) {
                                            search.push({
                                                type: doodadType,
                                                growingStage: growingStage,
                                                itemType: itemType,
                                                action: Enums_1.ActionType.Harvest
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return search;
        }
        getCreatureSearch(itemTypes) {
            const search = [];
            for (const itemType of itemTypes) {
                for (const creatureType of Enums_2.default.values(Enums_1.CreatureType)) {
                    if (creatureType !== Enums_1.CreatureType.Shark) {
                        const corpseDescription = Corpses_1.default[creatureType];
                        if (corpseDescription && corpseDescription.resource) {
                            for (const resource of corpseDescription.resource) {
                                if (resource.item === itemType) {
                                    search.push({
                                        type: creatureType,
                                        itemType: itemType
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return search;
        }
    }
    exports.default = AcquireItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQXFCQSxpQkFBaUMsU0FBUSxtQkFBUztRQUVqRCxZQUFvQixRQUFrQjtZQUNyQyxLQUFLLEVBQUUsQ0FBQztZQURXLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFdEMsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxlQUFlLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDaEYsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLGVBQTZDLENBQUM7Z0JBRWxELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUU1QyxlQUFlLEdBQUcsd0JBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRXZDLE1BQU0sYUFBYSxHQUFtQjtvQkFDckMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNwQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO29CQUNoRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ3BDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDJC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