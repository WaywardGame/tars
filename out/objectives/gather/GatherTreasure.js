define(["require", "exports", "game/doodad/IDoodad", "game/tile/Terrains", "utilities/game/TileHelpers", "game/entity/action/actions/Lockpick", "game/entity/action/actions/Cast", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../core/ReserveItems", "../core/Restart", "../other/item/MoveItemIntoInventory", "../other/item/UseItem", "../other/tile/DigTile", "../acquire/item/AcquireInventoryItem"], function (require, exports, IDoodad_1, Terrains_1, TileHelpers_1, Lockpick_1, Cast_1, IObjective_1, Objective_1, MoveToTarget_1, ReserveItems_1, Restart_1, MoveItemIntoInventory_1, UseItem_1, DigTile_1, AcquireInventoryItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherTreasure extends Objective_1.default {
        constructor(drawnMap, options) {
            super();
            this.drawnMap = drawnMap;
            this.options = options;
        }
        getIdentifier() {
            return `GatherTreasure:${this.drawnMap}`;
        }
        getStatus() {
            return `Gathering treasure`;
        }
        async execute(context) {
            const treasures = this.drawnMap.getTreasure();
            if (treasures.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            for (const treasure of treasures) {
                let objectives;
                const target = { x: treasure.x, y: treasure.y, z: context.human.z };
                const treasureTile = context.human.island.getTileFromPoint(target);
                if (this.drawnMap.isTreasureDiscovered(treasure)) {
                    const doodad = treasureTile.doodad;
                    if (!doodad) {
                        continue;
                    }
                    if (doodad.isInGroup(IDoodad_1.DoodadTypeGroup.LockedChest)) {
                        if (this.options?.disableUnlocking) {
                            continue;
                        }
                        objectives = [
                            new AcquireInventoryItem_1.default("lockPick"),
                            new MoveToTarget_1.default(target, true),
                            new UseItem_1.default(Lockpick_1.default, context.inventory.lockPick),
                        ];
                    }
                    else if (doodad.containedItems && doodad.containedItems.length > 0) {
                        if (this.options?.disableGrabbingItems) {
                            continue;
                        }
                        objectives = [];
                        for (const item of doodad.containedItems) {
                            objectives.push(new ReserveItems_1.default(item), new MoveItemIntoInventory_1.default(item));
                        }
                    }
                    else {
                        continue;
                    }
                }
                else {
                    objectives = [];
                    const needFishingRod = Terrains_1.default[TileHelpers_1.default.getType(treasureTile)]?.water ? true : false;
                    if (needFishingRod) {
                        objectives.push(new AcquireInventoryItem_1.default("fishing"));
                    }
                    objectives.push(new AcquireInventoryItem_1.default("lockPick"));
                    if (needFishingRod) {
                        objectives.push(new MoveToTarget_1.default(target, true));
                        objectives.push(new UseItem_1.default(Cast_1.default, context.inventory.fishing));
                    }
                    else {
                        objectives.push(new DigTile_1.default(target));
                    }
                }
                objectives.push(new Restart_1.default());
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherTreasure;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyVHJlYXN1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyVHJlYXN1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUVqRCxZQUE2QixRQUFrQixFQUFtQixPQUF5QztZQUN2RyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWtDO1FBRTNHLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0JBQW9CLENBQUM7UUFDaEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUM5QixJQUFJLFVBQXdCLENBQUM7Z0JBRTdCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzlFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVuRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzlDLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7b0JBQ25DLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1QsU0FBUztxQkFDWjtvQkFFRCxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDL0MsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFOzRCQUNoQyxTQUFTO3lCQUNaO3dCQUVELFVBQVUsR0FBRzs0QkFDVCxJQUFJLDhCQUFvQixDQUFDLFVBQVUsQ0FBQzs0QkFDcEMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7NEJBQzlCLElBQUksaUJBQU8sQ0FBQyxrQkFBUSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO3lCQUNwRCxDQUFDO3FCQUVMO3lCQUFNLElBQUksTUFBTSxDQUFDLGNBQWMsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2xFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRTs0QkFDcEMsU0FBUzt5QkFDWjt3QkFFRCxVQUFVLEdBQUcsRUFBRSxDQUFDO3dCQUVoQixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7NEJBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxFQUN0QixJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQyxDQUNsQyxDQUFDO3lCQUNMO3FCQUVKO3lCQUFNO3dCQUNILFNBQVM7cUJBQ1o7aUJBRUo7cUJBQU07b0JBRUgsVUFBVSxHQUFHLEVBQUUsQ0FBQztvQkFFaEIsTUFBTSxjQUFjLEdBQUcsa0JBQVEsQ0FBQyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQ3pGLElBQUksY0FBYyxFQUFFO3dCQUNoQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztxQkFDeEQ7b0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBRXRELElBQUksY0FBYyxFQUFFO3dCQUNoQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsY0FBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztxQkFFakU7eUJBQU07d0JBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztxQkFDeEM7aUJBQ0o7Z0JBR0QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUUvQixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdkM7WUFHRCxPQUFPLGtCQUFrQixDQUFDO1FBQzlCLENBQUM7S0FFSjtJQTdGRCxpQ0E2RkMifQ==