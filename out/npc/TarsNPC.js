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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventManager", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/entity/npc/NPC", "game/entity/player/IPlayer", "game/IObject", "game/item/IItem", "utilities/math/Direction", "game/entity/flowfield/IFlowFieldManager", "../ITarsMod"], function (require, exports, EventManager_1, IEntity_1, IHuman_1, IStats_1, NPC_1, IPlayer_1, IObject_1, IItem_1, Direction_1, IFlowFieldManager_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsNPC extends NPC_1.default {
        constructor(id, islandId = "", x = 0, y = 0, z = 0) {
            super((0, ITarsMod_1.getTarsMod)()?.npcType, id, islandId, x, y, z);
            const saveData = (0, ITarsMod_1.getTarsMod)().initializeTarsSaveData();
            this.tars = (0, ITarsMod_1.getTarsMod)().createAndLoadTars(this, saveData);
            this.tars.toggle(true);
            this.updateMovementIntent({ intent: Direction_1.Direction.None });
            this.setMoveType(IEntity_1.MoveType.Land | IEntity_1.MoveType.Water | IEntity_1.MoveType.ShallowWater);
        }
        initializeStats() {
            const strength = this.island.seededRandom.int(45, 50);
            const stamina = this.island.seededRandom.int(70, 80);
            const hunger = this.island.seededRandom.int(15, 20);
            const thirst = this.island.seededRandom.int(15, 20);
            this.stat.setMax(IStats_1.Stat.Health, strength, strength);
            this.stat.setMax(IStats_1.Stat.Stamina, stamina, stamina);
            this.stat.setMax(IStats_1.Stat.Hunger, hunger, hunger);
            this.stat.setMax(IStats_1.Stat.Thirst, thirst, thirst);
        }
        getDefaultCustomization() {
            return localPlayer.customization;
        }
        getDefaultName() {
            return (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.Name);
        }
        getDefaultEquipment(equipType) {
            switch (equipType) {
                case IHuman_1.EquipType.Chest:
                    return IItem_1.ItemType.TatteredClothShirt;
                case IHuman_1.EquipType.Legs:
                    return IItem_1.ItemType.TatteredClothTrousers;
            }
            return undefined;
        }
        getDefaultAiType() {
            return IEntity_1.AiType.Neutral;
        }
        getDefaultInventory() {
            const inventoryItems = [this.createItemInInventory(IItem_1.ItemType.LeafBedroll, IObject_1.Quality.Random, false)];
            const inventoryCount = this.island.seededRandom.int(7, 11);
            for (let _ = 0; _ < inventoryCount - 1; _++) {
                inventoryItems.push(this.createItemInInventory(this.island.seededRandom.getElement(IPlayer_1.setupSpawnItems), IObject_1.Quality.Random, false));
            }
            inventoryItems.push(this.createItemInInventory(IItem_1.ItemType.WoodenPole, IObject_1.Quality.Random, false));
            return inventoryItems;
        }
        isInFov() {
            return true;
        }
        onRemoved() {
            this.tars.disable(true);
            this.tars.unload();
        }
        checkMove(moveType, tileX, tileY, tileZ) {
            const tile = this.island.getTile(tileX, tileY, tileZ);
            if (!tile) {
                return -1;
            }
            if (this.island.isPlayerAtTile(tile)) {
                return -2;
            }
            const movePenalty = this.island.creatures.getMovePenalty(moveType, tile, true);
            if (movePenalty >= IFlowFieldManager_1.blockedPenalty) {
                return -3;
            }
            return 0;
        }
    }
    __decorate([
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "removed")
    ], TarsNPC.prototype, "onRemoved", null);
    exports.default = TarsNPC;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc05QQy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ucGMvVGFyc05QQy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7Ozs7Ozs7SUFvQkgsTUFBcUIsT0FBUSxTQUFRLGFBQUc7UUFJcEMsWUFBWSxFQUFXLEVBQUUsV0FBVyxFQUFjLEVBQUUsSUFBWSxDQUFDLEVBQUUsSUFBWSxDQUFDLEVBQUUsSUFBWSxDQUFDO1lBQzNGLEtBQUssQ0FBQyxJQUFBLHFCQUFVLEdBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXBELE1BQU0sUUFBUSxHQUFHLElBQUEscUJBQVUsR0FBRSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFBLHFCQUFVLEdBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFHdkIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLHFCQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFRLENBQUMsSUFBSSxHQUFHLGtCQUFRLENBQUMsS0FBSyxHQUFHLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVrQixlQUFlO1lBQzlCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZ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