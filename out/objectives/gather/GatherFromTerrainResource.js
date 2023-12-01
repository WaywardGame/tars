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
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemManager", "@wayward/game/game/tile/ITerrain", "@wayward/game/game/tile/Terrains", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../core/objective/Objective", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IItem_1, ItemManager_1, ITerrain_1, Terrains_1, Dictionary_1, Translation_1, Objective_1, AddDifficulty_1, ExecuteActionForItem_1, MoveToTarget_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5SZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpblJlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWlCSCxNQUFxQix5QkFBMEIsU0FBUSxtQkFBUztRQUUvRCxZQUE2QixNQUFnQztZQUM1RCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUEwQjtRQUU3RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDZCQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9NLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVlLFNBQVM7WUFLeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3pDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFz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