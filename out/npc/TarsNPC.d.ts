/*!
 * Copyright 2011-2021 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import { AiType, MoveType } from "game/entity/IEntity";
import type { ICustomizations } from "game/entity/IHuman";
import { EquipType } from "game/entity/IHuman";
import NPC from "game/entity/npc/NPC";
import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
export default class TarsNPC extends NPC {
    private readonly tars;
    constructor(id?: number, islandId?: `${number},${number}`, x?: number, y?: number, z?: number);
    protected initializeStats(): void;
    protected getDefaultCustomization(): ICustomizations;
    protected getDefaultName(): import("../../node_modules/@wayward/types/definitions/game/language/impl/TranslationImpl").default;
    protected getDefaultEquipment(equipType: EquipType): Item | ItemType | undefined;
    protected getDefaultAiType(): AiType;
    protected getDefaultInventory(): Array<Item | ItemType>;
    isInFov(): boolean;
    onRemoved(): void;
    protected checkMove(moveType: MoveType, tileX: number, tileY: number, tileZ: number): 0 | -1 | -2 | -3;
}
