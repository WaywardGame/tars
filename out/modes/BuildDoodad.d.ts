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
import type Doodad from "@wayward/game/game/doodad/Doodad";
import type DoodadManager from "@wayward/game/game/doodad/DoodadManager";
import type { DoodadType, DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import type Human from "@wayward/game/game/entity/Human";
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
