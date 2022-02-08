define(["require", "exports", "game/IGame", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/other/Idle", "game/item/IItem", "../objectives/gather/GatherTreasures"], function (require, exports, IGame_1, IObjective_1, Lambda_1, Idle_1, IItem_1, GatherTreasures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreasureHunterMode = exports.TreasureHunterType = void 0;
    var TreasureHunterType;
    (function (TreasureHunterType) {
        TreasureHunterType[TreasureHunterType["OnlyDiscoverTreasure"] = 0] = "OnlyDiscoverTreasure";
        TreasureHunterType[TreasureHunterType["DiscoverAndUnlockTreasure"] = 1] = "DiscoverAndUnlockTreasure";
        TreasureHunterType[TreasureHunterType["ObtainTreasure"] = 2] = "ObtainTreasure";
    })(TreasureHunterType = exports.TreasureHunterType || (exports.TreasureHunterType = {}));
    class TreasureHunterMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const objectives = [];
            let drawnMaps = [];
            if (context.options.treasureHunterPrecognition) {
                drawnMaps = context.human.island.treasureMaps;
            }
            else {
                drawnMaps =
                    context.utilities.item.getBaseItemsByType(context, IItem_1.ItemType.TatteredMap)
                        .map(item => item.map.get())
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJlYXN1cmVIdW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvVHJlYXN1cmVIdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVlBLElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUMxQiwyRkFBb0IsQ0FBQTtRQUNwQixxR0FBeUIsQ0FBQTtRQUN6QiwrRUFBYyxDQUFBO0lBQ2xCLENBQUMsRUFKVyxrQkFBa0IsR0FBbEIsMEJBQWtCLEtBQWxCLDBCQUFrQixRQUk3QjtJQUVELE1BQWEsa0JBQWtCO1FBSXBCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxJQUFJLFNBQVMsR0FBZSxFQUFFLENBQUM7WUFFL0IsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFO2dCQUM1QyxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2FBRWpEO2lCQUFNO2dCQUNILFNBQVM7b0JBQ0wsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdCQUFRLENBQUMsV0FBVyxDQUFDO3lCQUNuRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO3lCQUMzQixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFlLENBQUM7YUFDckU7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkseUJBQWUsQ0FBQyxTQUFTLEVBQUU7Z0JBQzNDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEtBQUssa0JBQWtCLENBQUMsb0JBQW9CO2dCQUNoRyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixLQUFLLGtCQUFrQixDQUFDLGNBQWM7YUFDakcsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxnQkFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDMUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBRVA7cUJBQU07b0JBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQUksRUFBRSxDQUFDLENBQUM7aUJBQy9CO2FBQ0o7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBQ0o7SUExQ0QsZ0RBMENDIn0=