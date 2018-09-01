var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "creature/corpse/Corpses", "doodad/Doodads", "Enums", "item/Items", "tile/TerrainResources", "utilities/enum/Enums", "../IObjective", "../Objective", "./AcquireBuildMoveToDoodad", "./AcquireBuildMoveToFire", "./AcquireItemByGroup", "./ExecuteAction", "./GatherFromChest", "./GatherFromCreature", "./GatherFromDoodad", "./GatherFromGround", "./GatherFromTerrain", "../Utilities/Item"], function (require, exports, Corpses_1, Doodads_1, Enums_1, Items_1, TerrainResources_1, Enums_2, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AcquireItemByGroup_1, ExecuteAction_1, GatherFromChest_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1, Item_1) {
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
                this.log.info(itemManager.getItemTypeGroupName(this.itemType, false));
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
                            const dismantleItem = Item_1.getItemInInventory(inventory, it);
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
                        Item_1.addTargetRecipe(recipe);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQXFCQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFFakQsWUFBb0IsUUFBa0I7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRXRDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sZUFBZSxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2hGLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsSUFBSSxlQUE2QyxDQUFDO2dCQUVsRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUV0RSxlQUFlLEdBQUcsd0JBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRXZDLE1BQU0sYUFBYSxHQUFtQjtvQkFDckMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNwQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO29CQUNoRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ3BDLGFBQWEsQ0FBQyxJQUFJLENB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