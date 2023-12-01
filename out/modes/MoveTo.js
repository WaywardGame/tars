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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL01vdmVUby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBcUJILElBQVksVUFRWDtJQVJELFdBQVksVUFBVTtRQUNyQiwrQ0FBTSxDQUFBO1FBQ04saURBQU8sQ0FBQTtRQUNQLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLDJDQUFJLENBQUE7UUFDSix5Q0FBRyxDQUFBO0lBQ0osQ0FBQyxFQVJXLFVBQVUsMEJBQVYsVUFBVSxRQVFyQjtJQTRDRCxNQUFhLFVBQVU7UUFJdEIsWUFBNkIsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDM0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3ZFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMxQixLQUFLLFVBQVUsQ0FBQyxNQUFNO29CQUNyQixPQUFPO3dCQUNOLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzt3QkFDdEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFOzRCQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNqQyxDQUFDLENBQUM7cUJBQ0YsQ0FBQztnQkFFSCxLQUFLLFVBQVUsQ0FBQyxPQUFPO29CQUN0QixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FB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