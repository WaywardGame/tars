import Doodad from "game/doodad/Doodad";
import DoodadManager from "game/doodad/DoodadManager";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Human from "game/entity/Human";
import Context from "../../Context";
import { IObjective } from "../../IObjective";
import { ITarsMode } from "../IMode";
export declare class BuildDoodadMode implements ITarsMode {
    private readonly doodadTypeOrGroup;
    private finished;
    private doodad;
    private doodadTypes;
    constructor(doodadTypeOrGroup: DoodadType | DoodadTypeGroup);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
    onDoodadCreate(_: DoodadManager, doodad: Doodad, creator?: Human): void;
}
