import type Doodad from "game/doodad/Doodad";
import type DoodadManager from "game/doodad/DoodadManager";
import type { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import type Human from "game/entity/Human";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
export declare class BuildDoodadMode implements ITarsMode {
    private readonly doodadTypeOrGroup;
    private finished;
    private doodadTypes;
    private doodad;
    constructor(doodadTypeOrGroup: DoodadType | DoodadTypeGroup);
    initialize(context: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
    onDoodadCreate(_: DoodadManager, doodad: Doodad, creator?: Human): void;
}
