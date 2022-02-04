import { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import type { IAcquireItemOptions } from "./AcquireBase";
import AcquireBase from "./AcquireBase";
export default class AcquireItem extends AcquireBase {
    private readonly itemType;
    private readonly options;
    private static readonly terrainSearchCache;
    private static readonly doodadSearchCache;
    private static readonly creatureSearchCache;
    private static readonly dismantleSearchCache;
    constructor(itemType: ItemType, options?: Partial<IAcquireItemOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean | Set<ItemType>;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getTerrainSearch;
    private getDoodadSearch;
    private getCreatureSearch;
    private getDismantleSearch;
}
