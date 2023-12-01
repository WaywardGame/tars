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
define(["require", "exports", "@wayward/game/game/entity/action/actions/GatherLiquid", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemManager", "@wayward/game/game/tile/ITerrain", "@wayward/game/game/tile/Terrains", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteActionForItem", "../core/MoveToTarget", "../other/tile/PickUpAllTileItems"], function (require, exports, GatherLiquid_1, IItem_1, ItemManager_1, ITerrain_1, Terrains_1, IObjective_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1, PickUpAllTileItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrainWater extends Objective_1.default {
        constructor(search, waterContainerContextDataKey) {
            super();
            this.search = search;
            this.waterContainerContextDataKey = waterContainerContextDataKey;
        }
        getIdentifier() {
            return `GatherFromTerrainWater:${this.search.map(search => `${ITerrain_1.TerrainType[search.type]}:${ItemManager_1.default.isGroup(search.itemType) ? IItem_1.ItemTypeGroup[search.itemType] : IItem_1.ItemType[search.itemType]}`).join(",")}`;
        }
        getStatus() {
            return "Gathering water from terrain";
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const terrainSearch of this.search) {
                const terrainDescription = Terrains_1.terrainDescriptions[terrainSearch.type];
                if (!terrainDescription) {
                    continue;
                }
                const tileLocations = context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);
                for (const { tile } of tileLocations) {
                    if (tile.creature || tile.npc || tile.doodad || tile.isPlayerOnTile()) {
                        continue;
                    }
                    objectivePipelines.push([
                        new MoveToTarget_1.default(tile, true),
                        new PickUpAllTileItems_1.default(tile),
                        new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [terrainSearch.itemType], {
                            genericAction: {
                                action: GatherLiquid_1.default,
                                args: (context) => {
                                    const item = context.getData(this.waterContainerContextDataKey);
                                    if (!item?.isValid) {
                                        this.log.warn(`Invalid water container ${item}`, this.waterContainerContextDataKey);
                                        return IObjective_1.ObjectiveResult.Restart;
                                    }
                                    return [item];
                                },
                            },
                        })
                            .passAcquireData(this),
                    ]);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherFromTerrainWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5XYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpbldhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWlCSCxNQUFxQixzQkFBdUIsU0FBUSxtQkFBUztRQUU1RCxZQUE2QixNQUE2QixFQUFtQiw0QkFBb0M7WUFDaEgsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7WUFBbUIsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUFRO1FBRWpILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sMEJBQTBCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxzQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDNU0sQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDhCQUE4QixDQUFDO1FBQ3ZDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sYUFBYSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxrQkFBa0IsR0FBRyw4QkFBbUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUN6QixTQUFTO2dCQUNWLENBQUM7Z0JBRUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFakcsS0FBSyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksYUFBYSxFQUFFLENBQUM7b0JBQ3RDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7d0JBQ3ZFLFNBQVM7b0JBQ1YsQ0FBQztvQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7d0JBQ3ZCLElBQUksc0JBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO3dCQUM1QixJQUFJLDRCQUFrQixDQUFDLElBQUksQ0FBQzt3QkFDNUIsSUFBSSw4QkFBb0IsQ0FDdkIsd0NBQWlCLENBQUMsT0FBTyxFQUN6QixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDeEI7NEJBQ0MsYUFBYSxFQUFFO2dDQUNkLE1BQU0sRUFBRSxzQkFBWTtnQ0FDcEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7b0NBQ2pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7b0NBQ2hFLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7d0NBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQzt3Q0FDcEYsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztvQ0FDaEMsQ0FBQztvQ0FFRCxPQUFPLENBQUMsSUFBSSxDQUEyQyxDQUFDO2dDQUN6RCxDQUFDOzZCQUNEO3lCQUNELENBQUM7NkJBQ0QsZUFBZSxDQUFDLElBQUksQ0FBQztxQkFDdkIsQ0FBQyxDQUFDO2dCQUNKLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUF6REQseUNBeURDIn0=