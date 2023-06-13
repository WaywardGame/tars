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
define(["require", "exports", "game/entity/action/IAction", "game/entity/player/IPlayer", "game/entity/action/actions/Extinguish", "game/entity/action/actions/Sleep", "game/entity/action/actions/Rest", "../../core/objective/Objective", "../core/ExecuteAction", "../interrupt/ReduceWeight", "../utility/moveTo/MoveToLand", "./Idle", "./RunAwayFromTarget", "../core/Restart"], function (require, exports, IAction_1, IPlayer_1, Extinguish_1, Sleep_1, Rest_1, Objective_1, ExecuteAction_1, ReduceWeight_1, MoveToLand_1, Idle_1, RunAwayFromTarget_1, Restart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rest extends Objective_1.default {
        constructor(force = false) {
            super();
            this.force = force;
        }
        getIdentifier() {
            return "Rest";
        }
        getStatus() {
            return "Resting";
        }
        async execute(context) {
            if (context.utilities.tile.isSwimmingOrOverWater(context) && !context.utilities.player.isUsingVehicle(context)) {
                return new MoveToLand_1.default();
            }
            const nearbyCreatures = context.utilities.creature.getNearbyCreatures(context, 10);
            if (nearbyCreatures.length > 0) {
                const nearbyCreature = nearbyCreatures[0];
                this.log.info(`Nearby creature ${nearbyCreature.getName().getString()} will prevent resting`);
                const objectivePipelines = [
                    [new Idle_1.default({ canMoveToIdle: false })],
                ];
                if (context.human.getWeightStatus() === IPlayer_1.WeightStatus.Overburdened) {
                    if (this.force) {
                        objectivePipelines.push([new ReduceWeight_1.default({ allowReservedItems: true }), new RunAwayFromTarget_1.default(nearbyCreature), new Restart_1.default()]);
                    }
                }
                else {
                    objectivePipelines.push([new RunAwayFromTarget_1.default(nearbyCreature, 8), new Restart_1.default()]);
                }
                return objectivePipelines;
            }
            const objectivePipeline = [];
            const extinguishableItem = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Extinguish)[0];
            if (extinguishableItem) {
                objectivePipeline.push(new ExecuteAction_1.default(Extinguish_1.default, [extinguishableItem]));
            }
            const bed = context.inventory.bed;
            if (bed) {
                objectivePipeline.push(new ExecuteAction_1.default(Sleep_1.default, [bed]).setStatus(this));
            }
            else {
                objectivePipeline.push(new ExecuteAction_1.default(Rest_1.default, []).setStatus(this));
            }
            return objectivePipeline;
        }
    }
    exports.default = Rest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBa0JILE1BQXFCLElBQUssU0FBUSxtQkFBUztRQUUxQyxZQUE2QixRQUFpQixLQUFLO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMvRyxPQUFPLElBQUksb0JBQVUsRUFBRSxDQUFDO2FBQ3hCO1lBRUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25GLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztnQkFFOUYsTUFBTSxrQkFBa0IsR0FBbUI7b0JBQzFDLENBQUMsSUFBSSxjQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDcEMsQ0FBQztnQkFFRixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEtBQUssc0JBQVksQ0FBQyxZQUFZLEVBQUU7b0JBQ2xFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHNCQUFZLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksMkJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUNoSTtpQkFFRDtxQkFBTTtvQkFDTixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDJCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ25GO2dCQUdELE9BQU8sa0JBQWtCLENBQUM7YUFDMUI7WUFFRCxNQUFNLGlCQUFpQixHQUFpQixFQUFFLENBQUM7WUFFM0MsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RyxJQUFJLGtCQUFrQixFQUFFO2dCQUV2QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1RTtZQUVELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQ2xDLElBQUksR0FBRyxFQUFFO2dCQUNSLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsZUFBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUV4RTtpQkFBTTtnQkFDTixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLGNBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMxRTtZQUVELE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztLQUVEO0lBN0RELHVCQTZEQyJ9