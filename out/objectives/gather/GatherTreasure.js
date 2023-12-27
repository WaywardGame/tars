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
define(["require", "exports", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/actions/Cast", "@wayward/game/game/entity/action/actions/Lockpick", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireInventoryItem", "../core/MoveToTarget", "../core/ReserveItems", "../core/Restart", "../other/item/MoveItemsIntoInventory", "../other/item/UseItem", "../other/tile/DigTile"], function (require, exports, IDoodad_1, Cast_1, Lockpick_1, IObjective_1, Objective_1, AcquireInventoryItem_1, MoveToTarget_1, ReserveItems_1, Restart_1, MoveItemsIntoInventory_1, UseItem_1, DigTile_1) {
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
                            objectives.push(new ReserveItems_1.default(item), new MoveItemsIntoInventory_1.default(item));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyVHJlYXN1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyVHJlYXN1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBd0JILE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUVwRCxZQUE2QixRQUFrQixFQUFtQixPQUF5QztZQUMxRyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWtDO1FBRTNHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sb0JBQW9CLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLFVBQXdCLENBQUM7Z0JBRTdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTVGLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29C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