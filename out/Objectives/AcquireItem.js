var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "creature/corpse/Corpses", "doodad/Doodads", "Enums", "item/Items", "tile/TerrainResources", "utilities/enum/Enums", "../IObjective", "../Objective", "../Utilities/Item", "./AcquireBuildMoveToDoodad", "./AcquireBuildMoveToFire", "./AcquireItemByGroup", "./ExecuteAction", "./GatherFromChest", "./GatherFromCreature", "./GatherFromDoodad", "./GatherFromGround", "./GatherFromTerrain"], function (require, exports, IAction_1, Corpses_1, Doodads_1, Enums_1, Items_1, TerrainResources_1, Enums_2, IObjective_1, Objective_1, Item_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AcquireItemByGroup_1, ExecuteAction_1, GatherFromChest_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1) {
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
                this.log.info(`Wants a ${itemManager.getItemTypeGroupName(this.itemType, false).toString()}`);
                let itemDescription = Items_1.itemDescriptions[this.itemType];
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
                            const dismantleItem = Item_1.getItemInInventory(inventory, it);
                            const hasItem = dismantleItem !== undefined;
                            let hasRequiredItem = true;
                            if (description.dismantle.required !== undefined) {
                                hasRequiredItem = itemManager.countItemsInContainerByGroup(localPlayer.inventory, description.dismantle.required) > 0;
                            }
                            if (hasItem) {
                                if (hasRequiredItem) {
                                    return new ExecuteAction_1.default(IAction_1.ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem));
                                }
                                else {
                                    objectiveSets.push([new AcquireItemByGroup_1.default(description.dismantle.required), new ExecuteAction_1.default(IAction_1.ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem))]);
                                }
                            }
                            else {
                                const terrainsToGatherDismantleItemFrom = this.getTerrainSearch([this.itemType]);
                                if (terrainsToGatherDismantleItemFrom.length > 0) {
                                    const objectiveSet = [new GatherFromTerrain_1.default(terrainsToGatherDismantleItemFrom)];
                                    if (!hasRequiredItem) {
                                        objectiveSet.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                                    }
                                    objectiveSet.push(new ExecuteAction_1.default(IAction_1.ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem)));
                                    objectiveSets.push(objectiveSet);
                                }
                                const doodadsToGatherDismantleItemFrom = this.getDoodadSearch([it]);
                                if (doodadsToGatherDismantleItemFrom.length > 0) {
                                    const objectiveSet = [new GatherFromDoodad_1.default(doodadsToGatherDismantleItemFrom)];
                                    if (!hasRequiredItem) {
                                        objectiveSet.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                                    }
                                    objectiveSet.push(new ExecuteAction_1.default(IAction_1.ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem)));
                                    objectiveSets.push(objectiveSet);
                                }
                                const creaturesToGatherDismantleItemFrom = this.getCreatureSearch([it]);
                                if (creaturesToGatherDismantleItemFrom.length > 0) {
                                    const objectiveSet = [new GatherFromCreature_1.default(creaturesToGatherDismantleItemFrom)];
                                    if (!hasRequiredItem) {
                                        objectiveSet.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                                    }
                                    objectiveSet.push(new ExecuteAction_1.default(IAction_1.ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem)));
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
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const recipe = itemDescription.recipe;
                const checker = Item_1.processRecipe(inventory, recipe, true);
                const requirementsMet = checker.requirementsMet();
                const hasAdditionalRequirements = itemManager.hasAdditionalRequirements(localPlayer, this.itemType);
                if (requirementsMet && hasAdditionalRequirements.requirementsMet) {
                    if (!calculateDifficulty) {
                        Item_1.resetTargetRecipes();
                    }
                    if (localPlayer.swimming) {
                    }
                    this.log.info(`Crafting ${Enums_1.ItemType[this.itemType]}`);
                    return new ExecuteAction_1.default(IAction_1.ActionType.Craft, action => action.execute(localPlayer, this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent));
                }
                else {
                    const recipeObjectives = [];
                    if (!calculateDifficulty) {
                        Item_1.addTargetRecipe(recipe);
                    }
                    const itemBase = checker.itemBaseComponent;
                    if (recipe.baseComponent !== undefined && !itemBase) {
                        this.log.info(`Need base component ${itemManager.isGroup(recipe.baseComponent) ? Enums_1.ItemTypeGroup[recipe.baseComponent] : Enums_1.ItemType[recipe.baseComponent]}`);
                        if (itemManager.isGroup(recipe.baseComponent)) {
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
                            this.log.info(`Need component. ${itemManager.isGroup(componentType) ? Enums_1.ItemTypeGroup[componentType] : Enums_1.ItemType[componentType]}`);
                            for (let j = 0; j < missingAmount; j++) {
                                if (itemManager.isGroup(componentType)) {
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
                return IObjective_1.ObjectiveStatus.Complete;
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
                                                action: IAction_1.ActionType.Gather
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
                                                action: IAction_1.ActionType.Harvest
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQXFCQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFFakQsWUFBNkIsUUFBa0I7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUUvQyxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGVBQWUsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNoRixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUU5RixJQUFJLGVBQWUsR0FBRyx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRXRELE1BQU0sYUFBYSxHQUFtQjtvQkFDckMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNwQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO29CQUNoRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ3BDLGFBQWEsQ0FB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