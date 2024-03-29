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
import { TerrainType } from "game/tile/ITerrain";
import Tile from "game/tile/Tile";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export interface IDigTileOptions {
    digUntilTypeIsNot: TerrainType;
}
export default class DigTile extends Objective {
    private readonly target;
    private readonly options?;
    constructor(target: Tile, options?: Partial<IDigTileOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
