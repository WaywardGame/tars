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
import { generateRandomCustomization } from "game/entity/player/Customizations";
import { setupSpawnItems } from "game/entity/player/IPlayer";
import { Quality } from "game/IObject";
import type { IslandId } from "game/island/IIsland";
import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import { Direction } from "utilities/math/Direction";
import { blockedPenalty } from "game/entity/flowfield/IFlowFieldManager";
import TranslationImpl from "language/impl/TranslationImpl";
import { Bound } from "utilities/Decorators";
import { SaveProperty } from "save/serializer/ISerializer";

import Tars from "../core/Tars";
import { getTarsMod, getTarsTranslation, ISaveData, TarsTranslation } from "../ITarsMod";
import TarsDialog from "../ui/TarsDialog";

export default class TarsNPC extends NPC {

    public override readonly isPlayerLike: boolean = true;

    public tarsInstance: Tars | undefined;

    @SaveProperty() private saveData: ISaveData | undefined;

    private registered = false;

    constructor(id?: number, islandId = "" as IslandId, x: number = 0, y: number = 0, z: number = 0) {
        super(getTarsMod()?.npcType, id, islandId, x, y, z);

        // do nothing by default
        this.updateMovementIntent({ intent: Direction.None });

        this.setMoveType(MoveType.Land | MoveType.Water | MoveType.ShallowWater);

        // handles setup when loading a saved game that contains this npc
        this.onRegister();
    }

    @Bound
    @OwnEventHandler(NPC, "spawn")
    public onSpawnOrPlay() {
        if (this.tarsInstance) {
            // already ready
            return;
        }

        if (!this.saveData) {
            this.saveData = getTarsMod().initializeTarsSaveData();
        }

        this.tarsInstance = getTarsMod().createAndLoadTars(this, this.saveData);

        if (this.tarsInstance.isEnabled()) {
            this.tarsInstance.toggle(true);
        }
    }

    @Bound
    @OwnEventHandler(NPC, "removed")
    public onRemoved() {
        if (this.tarsInstance) {
            this.tarsInstance.disable(true);
            this.tarsInstance.unload();
            this.tarsInstance = undefined;
        }
    }

    @OwnEventHandler(NPC, "reregister")
    public onRegister() {
        if (!this.registered) {
            this.registered = true;

            game.event.subscribe("play", this.onSpawnOrPlay);
            game.event.subscribe("playingEntityChange", this.onSpawnOrPlay);
            game.event.subscribe("stopPlay", this.onRemoved);
        }
    }

    @OwnEventHandler(NPC, "deregister")
    public onDeregister() {
        if (this.registered) {
            this.registered = false;

            game.event.unsubscribe("play", this.onSpawnOrPlay);
            game.event.unsubscribe("playingEntityChange", this.onSpawnOrPlay);
            game.event.unsubscribe("stopPlay", this.onRemoved);
        }
    }

    @OwnEventHandler(NPC, "renamed")
    public onRenamed() {
        if (this.tarsInstance) {
            const dialog = gameScreen?.dialogs.get<TarsDialog>(getTarsMod().dialogMain, this.tarsInstance.getDialogSubId());
            if (dialog) {
                dialog.refreshHeader();
            }
        }
    }

    protected override initializeStats() {
        const strength = this.island.seededRandom.int(45, 50);
        const stamina = this.island.seededRandom.int(70, 80);
        const hunger = this.island.seededRandom.int(15, 20);
        const thirst = this.island.seededRandom.int(15, 20);

        // Initialize the stat so we don't get a warning
        this.stat.setValue(Stat.Metabolism, 0);

        this.stat.setMax(Stat.Stamina, stamina, stamina);
        this.stat.setMax(Stat.Hunger, hunger, hunger);
        this.stat.setMax(Stat.Thirst, thirst, thirst);

        // max health is based on strength
        this.stat.setValue(Stat.Strength, strength);
        this.stat.setValue(Stat.Health, this.getMaxHealth());
    }

    protected override getDefaultCustomization(): ICustomizations {
        return generateRandomCustomization(this.island.seededRandom);
    }

    protected override getDefaultName() {
        const existingTarsNpcsNames: Set<string> = new Set();

        for (const npc of this.island.npcs) {
            if (npc instanceof TarsNPC) {
                existingTarsNpcsNames.add(npc.getName().toString());
            }
        }

        let defaultName: TranslationImpl;

        let i = 0;
        do {
            i++;
            defaultName = getTarsTranslation(TarsTranslation.NpcName).addArgs(i);
        } while (existingTarsNpcsNames.has(defaultName.toString()));

        return defaultName;
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

    public override update(): void {
        // no-op
    }

    public override isInFov(): boolean {
        // always allow updates for this npc
        return true;
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
