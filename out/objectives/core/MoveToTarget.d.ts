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
import Doodad from "@wayward/game/game/doodad/Doodad";
import Corpse from "@wayward/game/game/entity/creature/corpse/Corpse";
import Creature from "@wayward/game/game/entity/creature/Creature";
import Human from "@wayward/game/game/entity/Human";
import Item from "@wayward/game/game/item/Item";
import Tile from "@wayward/game/game/tile/Tile";
import TileEvent from "@wayward/game/game/tile/TileEvent";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
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
    onMove(context: Context): Promise<boolean | IObjective | EquipItem>;
}
