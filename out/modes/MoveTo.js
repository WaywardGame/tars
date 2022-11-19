define(["require", "exports", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/core/MoveToTarget", "../objectives/utility/moveTo/MoveToBase", "../objectives/utility/moveTo/MoveToIsland", "../core/context/IContext", "../objectives/contextData/SetContextData"], function (require, exports, IObjective_1, Lambda_1, MoveToTarget_1, MoveToBase_1, MoveToIsland_1, IContext_1, SetContextData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveToMode = exports.MoveToType = void 0;
    var MoveToType;
    (function (MoveToType) {
        MoveToType[MoveToType["Island"] = 0] = "Island";
        MoveToType[MoveToType["Terrain"] = 1] = "Terrain";
        MoveToType[MoveToType["Doodad"] = 2] = "Doodad";
        MoveToType[MoveToType["Creature"] = 3] = "Creature";
        MoveToType[MoveToType["Player"] = 4] = "Player";
        MoveToType[MoveToType["Base"] = 5] = "Base";
        MoveToType[MoveToType["NPC"] = 6] = "NPC";
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
                    const tileLocations = context.utilities.tile.getNearestTileLocation(context, this.target.terrainType);
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
                    const doodadTypes = context.utilities.doodad.getDoodadTypes(this.target.doodadType, true);
                    const doodadObjectives = context.utilities.object.findDoodads(context, "MoveToDoodad", (doodad) => doodadTypes.has(doodad.type), 5)
                        .map(doodad => ([
                        new MoveToTarget_1.default(doodad, true),
                        new Lambda_1.default(async () => {
                            this.finished(true);
                            return IObjective_1.ObjectiveResult.Complete;
                        }),
                    ]));
                    if (doodadObjectives.length > 0) {
                        return doodadObjectives;
                    }
                    break;
                case MoveToType.NPC:
                    const npcOrType = this.target.npc;
                    if (typeof (npcOrType) === "number") {
                        const npcObjectives = context.utilities.object.findNPCS(context, "MoveToNPC", (npc) => npc.type === npcOrType, 5)
                            .map(npc => ([
                            new MoveToTarget_1.default(npc, true),
                            new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }),
                        ]));
                        if (npcObjectives.length > 0) {
                            return npcObjectives;
                        }
                    }
                    else if (npcOrType === context.human) {
                        return [
                            new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }),
                        ];
                    }
                    else {
                        const objectives = [
                            new MoveToIsland_1.default(npcOrType.islandId),
                            new MoveToTarget_1.default(npcOrType, true),
                        ];
                        if (!this.target.follow) {
                            objectives.push(new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }));
                        }
                        return objectives;
                    }
                    break;
                case MoveToType.Creature:
                    const creatureType = this.target.creatureType;
                    const creatureObjectives = context.utilities.object.findCreatures(context, "MoveToCreature", creature => creature.type === creatureType, 5)
                        .map(creature => ([
                        new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, creature),
                        new MoveToTarget_1.default(creature, true),
                        new Lambda_1.default(async () => {
                            this.finished(true);
                            return IObjective_1.ObjectiveResult.Complete;
                        }),
                    ]));
                    if (creatureObjectives.length > 0) {
                        return creatureObjectives;
                    }
                    break;
                case MoveToType.Player:
                    const player = playerManager.getByIdentifier(this.target.playerIdentifier);
                    if (player) {
                        if (player === context.human) {
                            return [
                                new Lambda_1.default(async () => {
                                    this.finished(true);
                                    return IObjective_1.ObjectiveResult.Complete;
                                }),
                            ];
                        }
                        const objectives = [
                            new MoveToIsland_1.default(player.islandId),
                            new MoveToTarget_1.default(player, true),
                        ];
                        if (!this.target.follow) {
                            objectives.push(new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }));
                        }
                        return objectives;
                    }
                    break;
                case MoveToType.Base:
                    return [
                        new MoveToBase_1.default(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL01vdmVUby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBbUJBLElBQVksVUFRWDtJQVJELFdBQVksVUFBVTtRQUNsQiwrQ0FBTSxDQUFBO1FBQ04saURBQU8sQ0FBQTtRQUNQLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLDJDQUFJLENBQUE7UUFDSix5Q0FBRyxDQUFBO0lBQ1AsQ0FBQyxFQVJXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBUXJCO0lBNENELE1BQWEsVUFBVTtRQUluQixZQUE2QixNQUFjO1lBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUN0QixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNsQixPQUFPO3dCQUNILElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzt3QkFDdEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUM7cUJBQ0wsQ0FBQztnQkFFTixLQUFLLFVBQVUsQ0FBQyxPQUFPO29CQUNuQixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFFdEcsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDdEMsSUFBSSxzQkFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOzRCQUMxQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0NBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7NEJBQ3BDLENBQUMsQ0FBQzt5QkFDTCxDQUFDLENBQUMsQ0FBQztxQkFDUDtvQkFFRCxNQUFNO2dCQUVWLEtBQUssVUFBVSxDQUFDLE1BQU07b0JBQ2xCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFMUYsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUN0SSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNaLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO3dCQUM5QixJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7NEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7d0JBQ3BDLENBQUMsQ0FBQztxQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFUixJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQzdCLE9BQU8sZ0JBQWdCLENBQUM7cUJBQzNCO29CQUVELE1BQU07Z0JBRVYsS0FBSyxVQUFVLENBQUMsR0FBRztvQkFDZixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztvQkFDbEMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUSxFQUFFO3dCQUNqQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzZCQUNqSCxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRCQUNULElBQUksc0JBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDOzRCQUMzQixJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0NBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7NEJBQ3BDLENBQUMsQ0FBQzt5QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFFUixJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUMxQixPQUFPLGFBQWEsQ0FBQzt5QkFDeEI7cUJBRUo7eUJBQU0sSUFBSSxTQUFTLEtBQUssT0FBTyxDQUFDLEtBQUssRUFBRTt3QkFDcEMsT0FBTzs0QkFDSCxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0NBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7NEJBQ3BDLENBQUMsQ0FBQzt5QkFDTCxDQUFDO3FCQUVMO3lCQUFNO3dCQUNILE1BQU0sVUFBVSxHQUFpQjs0QkFDN0IsSUFBSSxzQkFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7NEJBQ3BDLElBQUksc0JBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO3lCQUNwQyxDQUFBO3dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTs0QkFDckIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0NBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7NEJBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ1A7d0JBRUQsT0FBTyxVQUFVLENBQUM7cUJBQ3JCO29CQUVELE1BQU07Z0JBRVYsS0FBSyxVQUFVLENBQUMsUUFBUTtvQkFDcEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7b0JBRTlDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFLENBQUMsQ0FBQzt5QkFDdEksR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDZCxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDO3dCQUM1RCxJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzt3QkFDaEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUM7cUJBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBRVIsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUMvQixPQUFPLGtCQUFrQixDQUFDO3FCQUM3QjtvQkFFRCxNQUFNO2dCQUVWLEtBQUssVUFBVSxDQUFDLE1BQU07b0JBQ2xCLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUUzRSxJQUFJLE1BQU0sRUFBRTt3QkFDUixJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFOzRCQUMxQixPQUFPO2dDQUNILElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtvQ0FDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQ0FDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQ0FDcEMsQ0FBQyxDQUFDOzZCQUNMLENBQUM7eUJBQ0w7d0JBRUQsTUFBTSxVQUFVLEdBQWlCOzRCQUM3QixJQUFJLHNCQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzs0QkFDakMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7eUJBQ2pDLENBQUE7d0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFOzRCQUNyQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtnQ0FDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzs0QkFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDUDt3QkFFRCxPQUFPLFVBQVUsQ0FBQztxQkFDckI7b0JBRUQsTUFBTTtnQkFFVixLQUFLLFVBQVUsQ0FBQyxJQUFJO29CQUNoQixPQUFPO3dCQUNILElBQUksb0JBQVUsRUFBRTt3QkFDaEIsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUM7cUJBQ0wsQ0FBQzthQUNUO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyQixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7S0FFSjtJQWpLRCxnQ0FpS0MifQ==