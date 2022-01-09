import type Player from "game/entity/player/Player";
import type { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import type { ITarsMode } from "../core/mode/IMode";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
export declare class AcquireItemMode implements ITarsMode {
    private readonly itemType;
    private finished;
    constructor(itemType: ItemType);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(_: Context): Promise<Array<IObjective | IObjective[]>>;
    onInventoryItemAddOrUpdate(_: Player, item: Item): void;
}
