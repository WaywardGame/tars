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
define(["require", "exports", "@wayward/game/game/entity/action/actions/SailToIsland", "@wayward/game/game/island/IIsland", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireInventoryItem", "../../core/ExecuteAction", "../../core/MoveToTarget", "./MoveToWater"], function (require, exports, SailToIsland_1, IIsland_1, IObjective_1, Objective_1, AcquireInventoryItem_1, ExecuteAction_1, MoveToTarget_1, MoveToWater_1) {
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
                const result = sailboat.tile.canSailAwayFrom(context.human);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvSXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvSXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWVILE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUVsRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sY0FBYyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxzQkFBc0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM5QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxNQUFNLGNBQWMsR0FBRyx3QkFBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7WUFDbkMsQ0FBQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3hCLGtCQUFrQixDQUFDLElBQUksQ0FBQzt3QkFDdkIsSUFBSSxzQkFBWSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUM7d0JBQ2pDLElBQUksdUJBQWEsQ0FBQyxzQkFBWSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO3FCQUNyRixDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFFckMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixJQUFJLDhCQUFvQixDQUFDLFVBQVUsQ0FBQztvQkFDcEMsSUFBSSxxQkFBVyxDQUFDLDZCQUFlLENBQUMsYUFBYSxDQUFDO29CQUM5QyxJQUFJLHVCQUFhLENBQUMsc0JBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztpQkFDckYsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUVEO0lBaERELCtCQWdEQyJ9