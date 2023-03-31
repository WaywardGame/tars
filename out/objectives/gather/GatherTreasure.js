define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/actions/Lockpick", "game/entity/action/actions/Cast", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../core/ReserveItems", "../core/Restart", "../other/item/MoveItemIntoInventory", "../other/item/UseItem", "../other/tile/DigTile", "../acquire/item/AcquireInventoryItem"], function (require, exports, IDoodad_1, Lockpick_1, Cast_1, IObjective_1, Objective_1, MoveToTarget_1, ReserveItems_1, Restart_1, MoveItemIntoInventory_1, UseItem_1, DigTile_1, AcquireInventoryItem_1) {
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
                const tile = context.human.island.getTile(treasure.x, treasure.y, this.drawnMap.position.z);
                if (this.drawnMap.isTreasureDiscovered(treasure)) {
                    const doodad = tile.doodad;
                    if (!doodad || doodad.crafterIdentifier) {
                        continue;
                    }
                    if (doodad.isInGroup(IDoodad_1.DoodadTypeGroup.LockedChest)) {
                        if (this.options?.disableUnlocking) {
                            continue;
                        }
                        objectives = [
                            new AcquireInventoryItem_1.default("lockPick"),
                            new MoveToTarget_1.default(tile, true),
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
                    const needFishingRod = tile.description?.water ? true : false;
                    if (needFishingRod) {
                        objectives.push(new AcquireInventoryItem_1.default("fishing"));
                    }
                    objectives.push(new AcquireInventoryItem_1.default("lockPick"));
                    if (needFishingRod) {
                        objectives.push(new MoveToTarget_1.default(tile, true));
                        objectives.push(new UseItem_1.default(Cast_1.default, context.inventory.fishing));
                    }
                    else {
                        objectives.push(new DigTile_1.default(tile));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyVHJlYXN1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyVHJlYXN1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBc0JBLE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUVqRCxZQUE2QixRQUFrQixFQUFtQixPQUF5QztZQUN2RyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWtDO1FBRTNHLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0JBQW9CLENBQUM7UUFDaEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUM5QixJQUFJLFVBQXdCLENBQUM7Z0JBRTdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTVGLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDM0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3JDLFNBQVM7cUJBQ1o7b0JBRUQsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLEVBQUU7d0JBQy9DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRTs0QkFDaEMsU0FBUzt5QkFDWjt3QkFFRCxVQUFVLEdBQUc7NEJBQ1QsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLENBQUM7NEJBQ3BDLElBQUksc0JBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDOzRCQUM1QixJQUFJLGlCQUFPLENBQUMsa0JBQVEsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzt5QkFDcEQsQ0FBQztxQkFFTDt5QkFBTSxJQUFJLE1BQU0sQ0FBQyxjQUFjLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNsRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUU7NEJBQ3BDLFNBQVM7eUJBQ1o7d0JBRUQsVUFBVSxHQUFHLEVBQUUsQ0FBQzt3QkFFaEIsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFOzRCQUN0QyxVQUFVLENBQUMsSUFBSSxDQUNYLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsRUFDdEIsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FDbEMsQ0FBQzt5QkFDTDtxQkFFSjt5QkFBTTt3QkFDSCxTQUFTO3FCQUNaO2lCQUVKO3FCQUFNO29CQUVILFVBQVUsR0FBRyxFQUFFLENBQUM7b0JBRWhCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDOUQsSUFBSSxjQUFjLEVBQUU7d0JBQ2hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3FCQUN4RDtvQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFFdEQsSUFBSSxjQUFjLEVBQUU7d0JBYWhCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUM5QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxjQUFJLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUVqRTt5QkFBTTt3QkFDSCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUN0QztpQkFDSjtnQkFHRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7Z0JBRS9CLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2QztZQUdELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBeEdELGlDQXdHQyJ9