import Doodad from "game/doodad/Doodad";
import { DoodadType } from "game/doodad/IDoodad";
import { IslandId } from "game/island/IIsland";
import { TerrainType } from "game/tile/ITerrain";
import Context from "../../Context";
import { IObjective, ObjectiveResult } from "../../IObjective";
import Lambda from "../../objectives/core/Lambda";
import MoveToTarget from "../../objectives/core/MoveToTarget";
import ReturnToBase from "../../objectives/other/ReturnToBase";
import MoveToIsland from "../../objectives/utility/moveTo/MoveToIsland";
import { doodadUtilities } from "../../utilities/Doodad";
import { objectUtilities } from "../../utilities/Object";
import { tileUtilities } from "../../utilities/Tile";
import { ITarsMode } from "../IMode";


export enum MoveToType {
    Island,
    Terrain,
    Doodad,
    Player,
    Base,
}

interface IMoveTo {
    type: MoveToType;
}

export interface IMoveToIsland extends IMoveTo {
    type: MoveToType.Island,
    islandId: IslandId;
}

export interface IMoveToTerrain extends IMoveTo {
    type: MoveToType.Terrain,
    terrainType: TerrainType;
}

export interface IMoveToDoodad extends IMoveTo {
    type: MoveToType.Doodad,
    doodadType: DoodadType;
}

export interface IMoveToPlayer extends IMoveTo {
    type: MoveToType.Player,
    playerIdentifier: string;
}

export interface IMoveToBase extends IMoveTo {
    type: MoveToType.Base,
}

export type MoveTo = IMoveToIsland | IMoveToTerrain | IMoveToDoodad | IMoveToPlayer | IMoveToBase;

export class MoveToMode implements ITarsMode {

    private finished: (success: boolean) => void;

    constructor(private readonly target: MoveTo) {
    }

    public async initialize(_: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        switch (this.target.type) {
            case MoveToType.Island:
                return [
                    new MoveToIsland(this.target.islandId),
                    new Lambda(async () => {
                        this.finished(true);
                        return ObjectiveResult.Complete;
                    }),
                ];

            case MoveToType.Terrain:
                const tileLocations = await tileUtilities.getNearestTileLocation(context, this.target.terrainType);

                if (tileLocations.length > 0) {
                    return tileLocations.map(tileLocation => ([
                        new MoveToTarget(tileLocation.point, true),
                        new Lambda(async () => {
                            this.finished(true);
                            return ObjectiveResult.Complete;
                        }),
                    ]));
                }

                break;

            case MoveToType.Doodad:
                const doodadTypes = doodadUtilities.getDoodadTypes(this.target.doodadType, true);

                const objectives = objectUtilities.findDoodads(context, "MoveToDoodad", (doodad: Doodad) => doodadTypes.has(doodad.type), 5)
                    .map(doodad => ([
                        new MoveToTarget(doodad, true),
                        new Lambda(async () => {
                            this.finished(true);
                            return ObjectiveResult.Complete;
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
                        new MoveToTarget(player, true),
                        new Lambda(async () => {
                            this.finished(true);
                            return ObjectiveResult.Complete;
                        }),
                    ];
                }

                break;

            case MoveToType.Base:
                return [
                    new ReturnToBase(),
                    new Lambda(async () => {
                        this.finished(true);
                        return ObjectiveResult.Complete;
                    }),
                ];
        }

        this.finished(false);

        return [];
    }

}
