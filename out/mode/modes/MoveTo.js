define(["require", "exports", "../../IObjective", "../../objectives/core/Lambda", "../../objectives/core/MoveToTarget", "../../objectives/other/ReturnToBase", "../../objectives/utility/moveTo/MoveToIsland", "../../utilities/Doodad", "../../utilities/Object", "../../utilities/Tile"], function (require, exports, IObjective_1, Lambda_1, MoveToTarget_1, ReturnToBase_1, MoveToIsland_1, Doodad_1, Object_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveToMode = exports.MoveToType = void 0;
    var MoveToType;
    (function (MoveToType) {
        MoveToType[MoveToType["Island"] = 0] = "Island";
        MoveToType[MoveToType["Terrain"] = 1] = "Terrain";
        MoveToType[MoveToType["Doodad"] = 2] = "Doodad";
        MoveToType[MoveToType["Player"] = 3] = "Player";
        MoveToType[MoveToType["Base"] = 4] = "Base";
    })(MoveToType = exports.MoveToType || (exports.MoveToType = {}));
    class MoveToMode {
        constructor(target) {
            this.target = target;
        }
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            switch (this.target.type) {
                case MoveToType.Island:
                    return [
                        new MoveToIsland_1.default(this.target.islandId),
                        new Lambda_1.default(async () => {
                            this.finished(true);
                            return IObjective_1.ObjectiveResult.Complete;
                        }),
                    ];
                case MoveToType.Terrain:
                    const tileLocations = await Tile_1.tileUtilities.getNearestTileLocation(context, this.target.terrainType);
                    if (tileLocations.length > 0) {
                        return tileLocations.map(tileLocation => ([
                            new MoveToTarget_1.default(tileLocation.point, true),
                            new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }),
                        ]));
                    }
                    break;
                case MoveToType.Doodad:
                    const doodadTypes = Doodad_1.doodadUtilities.getDoodadTypes(this.target.doodadType, true);
                    const objectives = Object_1.objectUtilities.findDoodads(context, "MoveToDoodad", (doodad) => doodadTypes.has(doodad.type), 5)
                        .map(doodad => ([
                        new MoveToTarget_1.default(doodad, true),
                        new Lambda_1.default(async () => {
                            this.finished(true);
                            return IObjective_1.ObjectiveResult.Complete;
                        }),
                    ]));
                    if (objectives.length > 0) {
                        return objectives;
                    }
                    break;
                case MoveToType.Player:
                    const player = playerManager.getByIdentifier(this.target.playerIdentifier);
                    if (player) {
                        return [
                            new MoveToTarget_1.default(player, true),
                            new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }),
                        ];
                    }
                    break;
                case MoveToType.Base:
                    return [
                        new ReturnToBase_1.default(),
                        new Lambda_1.default(async () => {
                            this.finished(true);
                            return IObjective_1.ObjectiveResult.Complete;
                        }),
                    ];
            }
            this.finished(false);
            return [];
        }
    }
    exports.MoveToMode = MoveToMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGUvbW9kZXMvTW92ZVRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFnQkEsSUFBWSxVQU1YO0lBTkQsV0FBWSxVQUFVO1FBQ2xCLCtDQUFNLENBQUE7UUFDTixpREFBTyxDQUFBO1FBQ1AsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTiwyQ0FBSSxDQUFBO0lBQ1IsQ0FBQyxFQU5XLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBTXJCO0lBZ0NELE1BQWEsVUFBVTtRQUluQixZQUE2QixNQUFjO1lBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUN0QixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNsQixPQUFPO3dCQUNILElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzt3QkFDdEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUM7cUJBQ0wsQ0FBQztnQkFFTixLQUFLLFVBQVUsQ0FBQyxPQUFPO29CQUNuQixNQUFNLGFBQWEsR0FBRyxNQUFNLG9CQUFhLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBRW5HLElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQ3RDLElBQUksc0JBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzs0QkFDMUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO2dDQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDOzRCQUNwQyxDQUFDLENBQUM7eUJBQ0wsQ0FBQyxDQUFDLENBQUM7cUJBQ1A7b0JBRUQsTUFBTTtnQkFFVixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNsQixNQUFNLFdBQVcsR0FBRyx3QkFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFakYsTUFBTSxVQUFVLEdBQUcsd0JBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUN2SCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNaLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO3dCQUM5QixJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7NEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7d0JBQ3BDLENBQUMsQ0FBQztxQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFUixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUN2QixPQUFPLFVBQVUsQ0FBQztxQkFDckI7b0JBRUQsTUFBTTtnQkFFVixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNsQixNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFFM0UsSUFBSSxNQUFNLEVBQUU7d0JBQ1IsT0FBTzs0QkFDSCxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQzs0QkFDOUIsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO2dDQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDOzRCQUNwQyxDQUFDLENBQUM7eUJBQ0wsQ0FBQztxQkFDTDtvQkFFRCxNQUFNO2dCQUVWLEtBQUssVUFBVSxDQUFDLElBQUk7b0JBQ2hCLE9BQU87d0JBQ0gsSUFBSSxzQkFBWSxFQUFFO3dCQUNsQixJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7NEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7d0JBQ3BDLENBQUMsQ0FBQztxQkFDTCxDQUFDO2FBQ1Q7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXJCLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUVKO0lBckZELGdDQXFGQyJ9