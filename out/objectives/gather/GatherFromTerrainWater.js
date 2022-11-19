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
                const tileLocations = context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5XYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpbldhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLE1BQTZCLEVBQW1CLDRCQUFvQztZQUNoSCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUF1QjtZQUFtQixpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQVE7UUFFakgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTywwQkFBMEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNCQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1TSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sOEJBQThCLENBQUM7UUFDdkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFO29CQUN4QixTQUFTO2lCQUNUO2dCQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWpHLEtBQUssTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFhLEVBQUU7b0JBQzVDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3BGLFNBQVM7cUJBQ1Q7b0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDO3dCQUN2QixJQUFJLHNCQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzt3QkFDN0IsSUFBSSw0QkFBa0IsQ0FBQyxLQUFLLENBQUM7d0JBQzdCLElBQUksOEJBQW9CLENBQ3ZCLHdDQUFpQixDQUFDLE9BQU8sRUFDekIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQ3hCOzRCQUNDLGFBQWEsRUFBRTtnQ0FDZCxNQUFNLEVBQUUsc0JBQVk7Z0NBQ3BCLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO29DQUNqQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO29DQUNoRSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO3dDQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7d0NBQ3BGLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUNBQy9CO29DQUVELE9BQU8sQ0FBQyxJQUFJLENBQXlDLENBQUM7Z0NBQ3ZELENBQUM7NkJBQ0Q7eUJBQ0QsQ0FBQzs2QkFDRCxlQUFlLENBQUMsSUFBSSxDQUFDO3FCQUN2QixDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBekRELHlDQXlEQyJ9