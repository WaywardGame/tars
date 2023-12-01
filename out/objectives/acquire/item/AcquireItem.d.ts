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
import { ItemType } from "@wayward/game/game/item/IItem";
import type Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import type { IAcquireItemOptions } from "./AcquireBase";
import AcquireBase from "./AcquireBase";
export default class AcquireItem extends AcquireBase {
    private readonly itemType;
    private readonly options;
    private static readonly terrainResourceSearchCache;
    private static readonly terrainWaterSearchCache;
    private static readonly doodadSearchCache;
    private static readonly creatureSearchCache;
    constructor(itemType: ItemType, options?: Partial<IAcquireItemOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean | Set<ItemType>;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getTerrainResourceSearch;
    private getTerrainWaterSearch;
    private getDoodadSearch;
    private getCreatureSearch;
}
