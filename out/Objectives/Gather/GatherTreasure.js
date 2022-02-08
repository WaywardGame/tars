define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/tile/Terrains", "utilities/game/TileHelpers", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../analyze/AnalyzeInventory", "../core/MoveToTarget", "../core/ReserveItems", "../core/Restart", "../other/item/MoveItemIntoInventory", "../other/item/UseItem", "../other/tile/DigTile"], function (require, exports, IDoodad_1, IAction_1, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, AcquireItemForAction_1, AnalyzeInventory_1, MoveToTarget_1, ReserveItems_1, Restart_1, MoveItemIntoInventory_1, UseItem_1, DigTile_1) {
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
            const fishingRod = context.inventory.fishingRod;
            const lockPick = context.inventory.lockPick;
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
                        objectives = [];
                        if (!lockPick) {
                            objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Lockpick), new AnalyzeInventory_1.default());
                        }
                        objectives.push(new MoveToTarget_1.default(target, true), new UseItem_1.default(IAction_1.ActionType.Lockpick, lockPick));
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
                        if (!fishingRod) {
                            objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Cast), new AnalyzeInventory_1.default());
                        }
                    }
                    if (!lockPick) {
                        objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Lockpick), new AnalyzeInventory_1.default());
                    }
                    if (needFishingRod) {
                        objectives.push(new MoveToTarget_1.default(target, true));
                        objectives.push(new UseItem_1.default(IAction_1.ActionType.Cast, fishingRod));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyVHJlYXN1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyVHJlYXN1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUVqRCxZQUE2QixRQUFrQixFQUFtQixPQUF5QztZQUN2RyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWtDO1FBRTNHLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0JBQW9CLENBQUM7UUFDaEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7WUFDaEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFFNUMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUM5QixJQUFJLFVBQXdCLENBQUM7Z0JBRTdCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzlFLE1BQU0s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