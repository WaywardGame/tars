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
    })(MoveToType || (exports.MoveToType = MoveToType = {}));
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
                            new MoveToTarget_1.default(tileLocation.tile, true),
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
                    const player = game.playerManager.getByIdentifier(this.target.playerIdentifier);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL01vdmVUby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBcUJILElBQVksVUFRWDtJQVJELFdBQVksVUFBVTtRQUNsQiwrQ0FBTSxDQUFBO1FBQ04saURBQU8sQ0FBQTtRQUNQLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLDJDQUFJLENBQUE7UUFDSix5Q0FBRyxDQUFBO0lBQ1AsQ0FBQyxFQVJXLFVBQVUsMEJBQVYsVUFBVSxRQVFyQjtJQTRDRCxNQUFhLFVBQVU7UUFJbkIsWUFBNkIsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDM0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDdEIsS0FBSyxVQUFVLENBQUMsTUFBTTtvQkFDbEIsT0FBTzt3QkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7d0JBQ3RDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTs0QkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDO3FCQUNMLENBQUM7Z0JBRU4sS0FBSyxVQUFVLENBQUMsT0FBTztvQkFDbkIsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsV0FB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