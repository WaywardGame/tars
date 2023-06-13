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
define(["require", "exports", "game/item/IItem", "game/item/ItemManager", "game/tile/ITerrain", "game/tile/Terrains", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IItem_1, ItemManager_1, ITerrain_1, Terrains_1, Dictionary_1, Translation_1, Objective_1, AddDifficulty_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrainResource extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getIdentifier() {
            return `GatherFromTerrainResource:${this.search.map(search => `${ITerrain_1.TerrainType[search.type]}:${ItemManager_1.default.isGroup(search.itemType) ? IItem_1.ItemTypeGroup[search.itemType] : IItem_1.ItemType[search.itemType]}`).join(",")}`;
        }
        getStatus() {
            return "Gathering items from terrain";
        }
        canGroupTogether() {
            return true;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const terrainSearch of this.search) {
                const tileLocations = context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);
                for (const tileLocation of tileLocations) {
                    this.processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation);
                }
                if (objectivePipelines.length === 0 && tileLocations.length === 5) {
                    for (const tileLocation of tileLocations) {
                        this.processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation, true);
                    }
                }
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 10;
        }
        processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation, skipSmartCheck) {
            const terrainDescription = Terrains_1.terrainDescriptions[terrainSearch.type];
            if (!terrainDescription) {
                return;
            }
            if (!context.utilities.tile.canGather(context, tileLocation.tile)) {
                return;
            }
            let step = 0;
            const tile = tileLocation.tile;
            const tileData = tile.getTileData();
            if (tileData && tileData.length > 0) {
                const tileDataStep = tileData[0].step;
                if (tileDataStep !== undefined) {
                    step = tileDataStep;
                }
            }
            let difficulty = 0;
            let matches = 0;
            const resources = context.island.getTerrainItems(terrainSearch?.resource);
            if (resources) {
                const nextLootItems = resources.slice(step);
                for (let i = 0; i < nextLootItems.length; i++) {
                    const loot = nextLootItems[i];
                    let chanceForHit = 0;
                    if (loot.type === terrainSearch.itemType) {
                        matches++;
                        if (loot.chance === undefined) {
                            difficulty = i * 2;
                            break;
                        }
                        chanceForHit = loot.chance / 100;
                        difficulty += 60 * (1 - chanceForHit);
                    }
                    else {
                        difficulty += 5;
                    }
                }
            }
            if (matches === 0) {
                if (skipSmartCheck) {
                    difficulty += 50000;
                }
                else {
                    if (step === 0) {
                        this.log.error("GatherFromTerrain no matches", step, IItem_1.ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
                    }
                    return;
                }
            }
            if (!terrainDescription.gather && !context.inventory.shovel) {
                difficulty += 500;
            }
            if (terrainSearch.extraDifficulty !== undefined) {
                difficulty += terrainSearch.extraDifficulty;
            }
            difficulty = Math.round(difficulty);
            objectivePipelines.push([
                new AddDifficulty_1.default(difficulty),
                new MoveToTarget_1.default(tile, true),
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType), { expectedTerrainType: terrainSearch.type })
                    .passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, terrainSearch.itemType).getString()} from ${Translation_1.default.nameOf(Dictionary_1.default.Terrain, terrainSearch.type).getString()}`),
            ]);
        }
    }
    exports.default = GatherFromTerrainResource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5SZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpblJlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWlCSCxNQUFxQix5QkFBMEIsU0FBUSxtQkFBUztRQUUvRCxZQUE2QixNQUFnQztZQUM1RCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUEwQjtRQUU3RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDZCQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9NLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVlLFNBQVM7WUFLeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN4QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FB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