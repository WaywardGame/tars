define(["require", "exports", "game/tile/ITerrain", "game/item/IItem", "game/item/ItemManager", "game/tile/Terrains", "game/entity/action/actions/GatherLiquid", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../other/tile/PickUpAllTileItems", "../core/ExecuteActionForItem"], function (require, exports, ITerrain_1, IItem_1, ItemManager_1, Terrains_1, GatherLiquid_1, IObjective_1, Objective_1, MoveToTarget_1, PickUpAllTileItems_1, ExecuteActionForItem_1) {
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
                const terrainDescription = Terrains_1.default[terrainSearch.type];
                if (!terrainDescription) {
                    continue;
                }
                const tileLocations = await context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);
                for (const { tile, point } of tileLocations) {
                    if (tile.creature || tile.npc || tile.doodad || context.island.isPlayerAtTile(tile)) {
                        continue;
                    }
                    objectivePipelines.push([
                        new MoveToTarget_1.default(point, true),
                        new PickUpAllTileItems_1.default(point),
                        new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [terrainSearch.itemType], {
                            genericAction: {
                                action: GatherLiquid_1.default,
                                args: (context) => {
                                    const item = context.getData(this.waterContainerContextDataKey);
                                    if (!item?.isValid()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5XYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpbldhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLE1BQTZCLEVBQW1CLDRCQUFvQztZQUNoSCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUF1QjtZQUFtQixpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQVE7UUFFakgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTywwQkFBMEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNCQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1TSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sOEJBQThCLENBQUM7UUFDdkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFO29CQUN4QixTQUFTO2lCQUNUO2dCQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFdkcsS0FBSyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQWEsRUFBRTtvQkFDNUMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDcEYsU0FBUztxQkFDVDtvQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7d0JBQ3ZCLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO3dCQUM3QixJQUFJLDRCQUFrQixDQUFDLEtBQUssQ0FBQzt3QkFDN0IsSUFBSSw4QkFBb0IsQ0FDdkIsd0NBQWlCLENBQUMsT0FBTyxFQUN6QixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDeEI7NEJBQ0MsYUFBYSxFQUFFO2dDQUNkLE1BQU0sRUFBRSxzQkFBWTtnQ0FDcEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7b0NBQ2pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7b0NBQ2hFLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0NBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQzt3Q0FDcEYsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztxQ0FDL0I7b0NBRUQsT0FBTyxDQUFDLElBQUksQ0FBeUMsQ0FBQztnQ0FDdkQsQ0FBQzs2QkFDRDt5QkFDRCxDQUFDOzZCQUNELGVBQWUsQ0FBQyxJQUFJLENBQUM7cUJBQ3ZCLENBQUMsQ0FBQztpQkFDSDthQUNEO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUF6REQseUNBeURDIn0=