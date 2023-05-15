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
define(["require", "exports", "game/IGame", "game/item/IItem", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/other/Idle", "../objectives/gather/GatherTreasures", "./BaseMode"], function (require, exports, IGame_1, IItem_1, IObjective_1, Lambda_1, Idle_1, GatherTreasures_1, BaseMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreasureHunterMode = exports.TreasureHunterType = void 0;
    var TreasureHunterType;
    (function (TreasureHunterType) {
        TreasureHunterType[TreasureHunterType["OnlyDiscoverTreasure"] = 0] = "OnlyDiscoverTreasure";
        TreasureHunterType[TreasureHunterType["DiscoverAndUnlockTreasure"] = 1] = "DiscoverAndUnlockTreasure";
        TreasureHunterType[TreasureHunterType["ObtainTreasure"] = 2] = "ObtainTreasure";
    })(TreasureHunterType = exports.TreasureHunterType || (exports.TreasureHunterType = {}));
    class TreasureHunterMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            let drawnMaps = [];
            if (context.options.treasureHunterPrecognition) {
                drawnMaps = context.human.island.treasureMaps;
            }
            else {
                drawnMaps =
                    context.utilities.item.getBaseItemsByType(context, IItem_1.ItemType.TatteredMap)
                        .map(item => item.map?.get())
                        .filter(drawnMap => drawnMap !== undefined);
            }
            objectives.push(new GatherTreasures_1.default(drawnMaps, {
                disableUnlocking: context.options.treasureHunterType === TreasureHunterType.OnlyDiscoverTreasure,
                disableGrabbingItems: context.options.treasureHunterType !== TreasureHunterType.ObtainTreasure,
            }));
            if (!multiplayer.isConnected()) {
                if (game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished(true);
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
                else {
                    objectives.push(new Idle_1.default());
                }
            }
            return objectives;
        }
    }
    exports.TreasureHunterMode = TreasureHunterMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJlYXN1cmVIdW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvVHJlYXN1cmVIdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWVILElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUMxQiwyRkFBb0IsQ0FBQTtRQUNwQixxR0FBeUIsQ0FBQTtRQUN6QiwrRUFBYyxDQUFBO0lBQ2xCLENBQUMsRUFKVyxrQkFBa0IsR0FBbEIsMEJBQWtCLEtBQWxCLDBCQUFrQixRQUk3QjtJQUVELE1BQWEsa0JBQW1CLFNBQVEsbUJBQVE7UUFJckMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRXZFLElBQUksU0FBUyxHQUFlLEVBQUUsQ0FBQztZQUUvQixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUU7Z0JBQzVDLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFFakQ7aUJBQU07Z0JBQ0gsU0FBUztvQkFDTCxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsZ0JBQVEsQ0FBQyxXQUFXLENBQUM7eUJBQ25FLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7eUJBQzVCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQWUsQ0FBQzthQUNyRTtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx5QkFBZSxDQUFDLFNBQVMsRUFBRTtnQkFDM0MsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsS0FBSyxrQkFBa0IsQ0FBQyxvQkFBb0I7Z0JBQ2hHLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEtBQUssa0JBQWtCLENBQUMsY0FBYzthQUNqRyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLGdCQUFRLENBQUMsUUFBUSxFQUFFO29CQUMxQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFFUDtxQkFBTTtvQkFDSCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksY0FBSSxFQUFFLENBQUMsQ0FBQztpQkFDL0I7YUFDSjtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FDSjtJQTVDRCxnREE0Q0MifQ==