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
define(["require", "exports", "game/island/IIsland", "game/entity/action/actions/SailToIsland", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/MoveToTarget", "./MoveToWater", "../../acquire/item/AcquireInventoryItem"], function (require, exports, IIsland_1, SailToIsland_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, MoveToWater_1, AcquireInventoryItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToIsland extends Objective_1.default {
        constructor(islandId) {
            super();
            this.islandId = islandId;
        }
        getIdentifier() {
            return "MoveToIsland";
        }
        getStatus() {
            return `Moving to a island ${this.islandId}`;
        }
        async execute(context) {
            if (context.human.islandId === this.islandId) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const islandPosition = IIsland_1.IslandPosition.fromId(this.islandId);
            if (islandPosition === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectivePipelines = [];
            for (const sailboat of context.base.sailboat) {
                const result = sailboat.tile.canSailAwayFrom();
                if (result.canSailAway) {
                    objectivePipelines.push([
                        new MoveToTarget_1.default(sailboat, false),
                        new ExecuteAction_1.default(SailToIsland_1.default, [islandPosition.x, islandPosition.y]).setStatus(this),
                    ]);
                }
            }
            if (objectivePipelines.length === 0) {
                objectivePipelines.push([
                    new AcquireInventoryItem_1.default("sailboat"),
                    new MoveToWater_1.default(MoveToWater_1.MoveToWaterType.SailAwayWater),
                    new ExecuteAction_1.default(SailToIsland_1.default, [islandPosition.x, islandPosition.y]).setStatus(this),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvSXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvSXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWVILE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxzQkFBc0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sY0FBYyxHQUFHLHdCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1RCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFO29CQUNwQixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7d0JBQ3BCLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO3dCQUNqQyxJQUFJLHVCQUFhLENBQUMsc0JBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztxQkFDeEYsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7WUFFRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBRWpDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDcEIsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLENBQUM7b0JBQ3BDLElBQUkscUJBQVcsQ0FBQyw2QkFBZSxDQUFDLGFBQWEsQ0FBQztvQkFDOUMsSUFBSSx1QkFBYSxDQUFDLHNCQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7aUJBQ3hGLENBQUMsQ0FBQzthQUNOO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO0tBRUo7SUFoREQsK0JBZ0RDIn0=