import Player from "game/entity/player/Player";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { ITarsMode } from "../core/mode/IMode";
import Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
export declare class AcquireItemMode implements ITarsMode {
    private readonly itemType;
    private finished;
    constructor(itemType: ItemType);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(_: Context): Promise<Array<IObjective | IObjective[]>>;
    onInventoryItemAddOrUpdate(_: Player, item: Item): void;
}
