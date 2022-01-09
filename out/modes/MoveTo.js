define(["require", "exports", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/core/MoveToTarget", "../objectives/other/ReturnToBase", "../objectives/utility/moveTo/MoveToIsland"], function (require, exports, IObjective_1, Lambda_1, MoveToTarget_1, ReturnToBase_1, MoveToIsland_1) {
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
        MoveToType[MoveToType["NPC"] = 5] = "NPC";
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
                        .map(doodad => ([
                        new MoveToTarget_1.default(doodad, true),
                        new Lambda_1.default(async () => {
                            this.finished(true);
                            return IObjective_1.ObjectiveResult.Complete;
                        }),
                    ]));
                    if (npcObjectives.length > 0) {
                        return npcObjectives;
                    }
                    break;
                case MoveToType.Player:
                    const player = playerManager.getByIdentifier(this.target.playerIdentifier);
                    if (player) {
                        if (player === context.player) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL01vdmVUby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZUEsSUFBWSxVQU9YO0lBUEQsV0FBWSxVQUFVO1FBQ2xCLCtDQUFNLENBQUE7UUFDTixpREFBTyxDQUFBO1FBQ1AsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTiwyQ0FBSSxDQUFBO1FBQ0oseUNBQUcsQ0FBQTtJQUNQLENBQUMsRUFQVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU9yQjtJQXFDRCxNQUFhLFVBQVU7UUFJbkIsWUFBNkIsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDM0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDdEIsS0FBSyxVQUFVLENBQUMsTUFBTTtvQkFDbEIsT0FBTzt3QkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7d0JBQ3RDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTs0QkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDO3FCQUNMLENBQUM7Z0JBRU4sS0FBSyxVQUFVLENBQUMsT0FBTztvQkFDbkIsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFFNUcs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