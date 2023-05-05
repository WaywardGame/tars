import Doodad from "game/doodad/Doodad";
import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
import Item from "game/item/Item";
import TileEvent from "game/tile/TileEvent";
import type { IVector3 } from "utilities/math/IVector";
import Human from "game/entity/Human";
import Tile from "game/tile/Tile";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import EquipItem from "../other/item/EquipItem";
export interface IMoveToTargetOptions {
    range: number;
    stopWhenWithinRange: boolean;
    disableStaminaCheck: boolean;
    disableTracking: boolean;
    allowBoat: boolean;
    skipIfAlreadyThere: boolean;
    idleIfAlreadyThere: boolean;
    equipWeapons: boolean;
    skipZCheck: boolean;
    changeZ: number;
    reverse: boolean;
}
export default class MoveToTarget extends Objective {
    protected target: Human | Creature | TileEvent | Doodad | Corpse | Tile;
    protected readonly moveAdjacentToTarget: boolean;
    protected readonly options?: Partial<IMoveToTargetOptions> | undefined;
    private trackedCreature;
    private trackedCorpse;
    private trackedItem;
    private trackedPosition;
    readonly includePositionInHashCode: boolean;
    constructor(target: Human | Creature | TileEvent | Doodad | Corpse | Tile, moveAdjacentToTarget: boolean, options?: Partial<IMoveToTargetOptions> | undefined);
    getIdentifier(context: Context | undefined): string;
    getStatus(context: Context): string | undefined;
    getPosition(): IVector3;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    trackItem(item: Item | undefined): this;
    onItemRemoved(context: Context, item: Item): boolean;
    onCreatureRemoved(context: Context, creature: Creature): boolean;
    onCorpseRemoved(context: Context, corpse: Corpse): boolean;
    onMove(context: Context): Promise<boolean | import("../../core/objective/IObjective").IObjective | EquipItem>;
}
