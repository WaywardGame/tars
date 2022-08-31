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
                        return [
                            new MoveToIsland_1.default(npcOrType.islandId),
                            new MoveToTarget_1.default(npcOrType, true),
                            new Lambda_1.default(async () => {
                                this.finished(true);
                                return IObjective_1.ObjectiveResult.Complete;
                            }),
                        ];
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
                        return [
                            new MoveToIsland_1.default(player.islandId),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL01vdmVUby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBbUJBLElBQVksVUFRWDtJQVJELFdBQVksVUFBVTtRQUNsQiwrQ0FBTSxDQUFBO1FBQ04saURBQU8sQ0FBQTtRQUNQLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLDJDQUFJLENBQUE7UUFDSix5Q0FBRyxDQUFBO0lBQ1AsQ0FBQyxFQVJXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBUXJCO0lBMENELE1BQWEsVUFBVTtRQUluQixZQUE2QixNQUFjO1lBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUN0QixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNsQixPQUFPO3dCQUNILElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzt3QkFDdEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUM7cUJBQ0wsQ0FBQztnQkFFTixLQUFLLFVBQVUsQ0FBQyxPQUFPO29CQUNuQixNQUFNLGFBQWEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcs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