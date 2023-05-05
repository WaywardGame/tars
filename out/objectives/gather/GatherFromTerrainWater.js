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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5XYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpbldhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLE1BQTZCLEVBQW1CLDRCQUFvQztZQUNoSCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUF1QjtZQUFtQixpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQVE7UUFFakgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTywwQkFBMEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNCQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1TSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sOEJBQThCLENBQUM7UUFDdkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsTUFBTSxrQkFBa0IsR0FBRyw4QkFBbUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDeEIsU0FBUztpQkFDVDtnQkFFRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVqRyxLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxhQUFhLEVBQUU7b0JBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFO3dCQUN0RSxTQUFTO3FCQUNUO29CQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQzt3QkFDdkIsSUFBSSxzQkFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7d0JBQzVCLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDO3dCQUM1QixJQUFJLDhCQUFvQixDQUN2Qix3Q0FBaUIsQ0FBQyxPQUFPLEVBQ3pCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUN4Qjs0QkFDQyxhQUFhLEVBQUU7Z0NBQ2QsTUFBTSxFQUFFLHNCQUFZO2dDQUNwQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQ0FDakIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztvQ0FDaEUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTt3Q0FDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO3dDQUNwRixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO3FDQUMvQjtvQ0FFRCxPQUFPLENBQUMsSUFBSSxDQUF5QyxDQUFDO2dDQUN2RCxDQUFDOzZCQUNEO3lCQUNELENBQUM7NkJBQ0QsZUFBZSxDQUFDLElBQUksQ0FBQztxQkFDdkIsQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQXpERCx5Q0F5REMifQ==