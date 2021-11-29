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
                    const doodadObjectives = Object_1.objectUtilities.findDoodads(context, "MoveToDoodad", (doodad) => doodadTypes.has(doodad.type), 5)
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
                    const npcObjectives = Object_1.objectUtilities.findNPCS(context, "MoveToNPC", (npc) => npc.type === npcType, 5)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGUvbW9kZXMvTW92ZVRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFrQkEsSUFBWSxVQU9YO0lBUEQsV0FBWSxVQUFVO1FBQ2xCLCtDQUFNLENBQUE7UUFDTixpREFBTyxDQUFBO1FBQ1AsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTiwyQ0FBSSxDQUFBO1FBQ0oseUNBQUcsQ0FBQTtJQUNQLENBQUMsRUFQVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU9yQjtJQXFDRCxNQUFhLFVBQVU7UUFJbkIsWUFBNkIsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDM0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDdEIsS0FBSyxVQUFVLENBQUMsTUFBTTtvQkFDbEIsT0FBTzt3QkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7d0JBQ3RDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTs0QkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDO3FCQUNMLENBQUM7Z0JBRU4sS0FBSyxVQUFVLENBQUMsT0FBTztvQkFDbkIsTUFBTSxhQUFhLEdBQUcsTUFBTSxvQkFBYSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUVuRyxJQUFJLGFBQWEs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