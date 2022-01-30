define(["require", "exports", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/core/MoveToTarget", "../objectives/other/ReturnToBase", "../objectives/utility/moveTo/MoveToIsland", "../core/context/IContext", "../objectives/contextData/SetContextData"], function (require, exports, IObjective_1, Lambda_1, MoveToTarget_1, ReturnToBase_1, MoveToIsland_1, IContext_1, SetContextData_1) {
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
                    const tileLocations = await context.utilities.tile.getNearestTileLocation(context, this.target.terrainType);
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
                    const npcType = this.target.npcType;
                    const npcObjectives = context.utilities.object.findNPCS(context, "MoveToNPC", (npc) => npc.type === npcType, 5)
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
                    break;
                case MoveToType.Creature:
                    const creatureType = this.target.creatureType;
                    const creatureObjectives = context.utilities.object.findCreatures(context, "MoveToCreature", creature => creature.type === creatureType, 5)
                        .map(creature => ([
                        new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, creature),
                        new MoveToTarget_1.default(creature, true).trackCreature(creature),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL01vdmVUby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBbUJBLElBQVksVUFRWDtJQVJELFdBQVksVUFBVTtRQUNsQiwrQ0FBTSxDQUFBO1FBQ04saURBQU8sQ0FBQTtRQUNQLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLDJDQUFJLENBQUE7UUFDSix5Q0FBRyxDQUFBO0lBQ1AsQ0FBQyxFQVJXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBUXJCO0lBMENELE1BQWEsVUFBVTtRQUluQixZQUE2QixNQUFjO1lBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUN0QixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNsQixPQUFPO3dCQUNILElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzt3QkFDdEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUM7cUJBQ0wsQ0FBQztnQkFFTixLQUFLLFVBQVUsQ0FBQyxPQUFPO29CQUNuQixNQUFNLGFBQWEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcs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