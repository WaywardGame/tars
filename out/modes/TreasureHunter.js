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
define(["require", "exports", "@wayward/game/game/IGame", "@wayward/game/game/item/IItem", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/other/Idle", "../objectives/gather/GatherTreasures", "./BaseMode"], function (require, exports, IGame_1, IItem_1, IObjective_1, Lambda_1, Idle_1, GatherTreasures_1, BaseMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreasureHunterMode = exports.TreasureHunterType = void 0;
    var TreasureHunterType;
    (function (TreasureHunterType) {
        TreasureHunterType[TreasureHunterType["OnlyDiscoverTreasure"] = 0] = "OnlyDiscoverTreasure";
        TreasureHunterType[TreasureHunterType["DiscoverAndUnlockTreasure"] = 1] = "DiscoverAndUnlockTreasure";
        TreasureHunterType[TreasureHunterType["ObtainTreasure"] = 2] = "ObtainTreasure";
    })(TreasureHunterType || (exports.TreasureHunterType = TreasureHunterType = {}));
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
            if (!multiplayer.isConnected) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJlYXN1cmVIdW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvVHJlYXN1cmVIdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWVILElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUM3QiwyRkFBb0IsQ0FBQTtRQUNwQixxR0FBeUIsQ0FBQTtRQUN6QiwrRUFBYyxDQUFBO0lBQ2YsQ0FBQyxFQUpXLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBSTdCO0lBRUQsTUFBYSxrQkFBbUIsU0FBUSxtQkFBUTtRQUl4QyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUN2RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQ2hELE1BQU0sVUFBVSxHQUFxQyxFQUFFLENBQUM7WUFFeEQsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFdkUsSUFBSSxTQUFTLEdBQWUsRUFBRSxDQUFDO1lBRS9CLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxDQUFDO2dCQUNoRCxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBRS9DLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxTQUFTO29CQUNSLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxnQkFBUSxDQUFDLFdBQVcsQ0FBQzt5QkFDdEUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzt5QkFDNUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBZSxDQUFDO1lBQzdELENBQUM7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkseUJBQWUsQ0FBQyxTQUFTLEVBQUU7Z0JBQzlDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEtBQUssa0JBQWtCLENBQUMsb0JBQW9CO2dCQUNoRyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixLQUFLLGtCQUFrQixDQUFDLGNBQWM7YUFDOUYsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM5QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxnQkFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUM5QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFTCxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzdCLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBNUNELGdEQTRDQyJ9