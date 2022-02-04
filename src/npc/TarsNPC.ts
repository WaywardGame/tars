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

import { OwnEventHandler } from "event/EventManager";
import { AiType, MoveType } from "game/entity/IEntity";
import type { ICustomizations } from "game/entity/IHuman";
import { EquipType } from "game/entity/IHuman";
import { Stat } from "game/entity/IStats";
import NPC from "game/entity/npc/NPC";
// import { generateRandomCustomization } from "game/entity/player/Customizations";
import { setupSpawnItems } from "game/entity/player/IPlayer";
import { Quality } from "game/IObject";
import type { IslandId } from "game/island/IIsland";
import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import { Direction } from "utilities/math/Direction";
import { blockedPenalty } from "game/entity/flowfield/IFlowFieldManager";

import Tars from "../core/Tars";
import { getTarsMod, getTarsTranslation, TarsTranslation } from "../ITarsMod";

export default class TarsNPC extends NPC {

    private readonly tars: Tars;

    constructor(id?: number, islandId = "" as IslandId, x: number = 0, y: number = 0, z: number = 0) {
        super(getTarsMod()?.npcType, id, islandId, x, y, z);

        const saveData = getTarsMod().initializeTarsSaveData();
        this.tars = getTarsMod().createAndLoadTars(this, saveData);
        this.tars.toggle(true);

        // do nothing by default
        this.updateMovementIntent({ intent: Direction.None });

        this.setMoveType(MoveType.Land | MoveType.Water | MoveType.ShallowWater);
    }

    protected override initializeStats() {
        const strength = this.island.seededRandom.int(45, 50);
        const stamina = this.island.seededRandom.int(70, 80);
        const hunger = this.island.seededRandom.int(15, 20);
        const thirst = this.island.seededRandom.int(15, 20);

        // this.stat.setValue(Stat.Strength, strength);

        this.stat.setMax(Stat.Health, strength, strength);
        this.stat.setMax(Stat.Stamina, stamina, stamina);
        this.stat.setMax(Stat.Hunger, hunger, hunger);
        this.stat.setMax(Stat.Thirst, thirst, thirst);
    }

    protected override getDefaultCustomization(): ICustomizations {
        return localPlayer.customization; // generateRandomCustomization(this.island.seededRandom);
    }

    protected override getDefaultName() {
        return getTarsTranslation(TarsTranslation.Name);
    }

    protected override getDefaultEquipment(equipType: EquipType): Item | ItemType | undefined {
        switch (equipType) {
            case EquipType.Chest:
                return ItemType.TatteredClothShirt;

            case EquipType.Legs:
                return ItemType.TatteredClothTrousers;
        }

        return undefined;
    }

    protected override getDefaultAiType(): AiType {
        return AiType.Neutral;
    }

    protected override getDefaultInventory(): Array<Item | ItemType> {
        const inventoryItems = [this.createItemInInventory(ItemType.LeafBedroll, Quality.Random, false)];

        const inventoryCount = this.island.seededRandom.int(7, 11);
        for (let _ = 0; _ < inventoryCount - 1; _++) {
            inventoryItems.push(this.createItemInInventory(this.island.seededRandom.getElement(setupSpawnItems), Quality.Random, false));
        }

        inventoryItems.push(this.createItemInInventory(ItemType.WoodenPole, Quality.Random, false));

        return inventoryItems;
    }

    // public override update(): void {
    //     // this.updateMovementIntent({ intent: Direction.South });
    //     super.update();
    // }

    public override isInFov(): boolean {
        // always allow updates for this npc
        return true;
    }

    @OwnEventHandler(NPC, "removed")
    public onRemoved() {
        this.tars.disable(true);
        this.tars.unload();
    }

    protected override checkMove(moveType: MoveType, tileX: number, tileY: number, tileZ: number) {
        // Wrap the coordinates for when we check against the player's position
        const tile = this.island.getTile(tileX, tileY, tileZ);
        if (!tile) {
            return -1;
        }

        if (this.island.isPlayerAtTile(tile)) {
            return -2;
        }

        const movePenalty = this.island.creatures.getMovePenalty(moveType, tile, true);
        if (movePenalty >= blockedPenalty) {
            return -3;
        }

        return 0;
    }
}
