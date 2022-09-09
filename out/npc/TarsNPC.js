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
define(["require", "exports", "event/EventManager", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/entity/npc/NPC", "game/entity/player/Customizations", "game/entity/player/IPlayer", "game/IObject", "game/item/IItem", "utilities/math/Direction", "game/entity/flowfield/IFlowFieldManager", "utilities/Decorators", "save/serializer/ISerializer", "language/Dictionary", "language/dictionary/HumanName", "language/Translation", "game/island/Island", "game/Game", "../ITarsMod"], function (require, exports, EventManager_1, IEntity_1, IHuman_1, IStats_1, NPC_1, Customizations_1, IPlayer_1, IObject_1, IItem_1, Direction_1, IFlowFieldManager_1, Decorators_1, ISerializer_1, Dictionary_1, HumanName_1, Translation_1, Island_1, Game_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsNPC extends NPC_1.default {
        constructor(id, islandId = "", x = 0, y = 0, z = 0) {
            super((0, ITarsMod_1.getTarsMod)().npcType, id, islandId, x, y, z);
            this.isPlayerLike = true;
            this.registered = false;
            this.updateMovementIntent({ intent: Direction_1.Direction.None });
            this.setMoveType(IEntity_1.MoveType.Land | IEntity_1.MoveType.Water | IEntity_1.MoveType.ShallowWater);
            this.setWalkPath(undefined);
            this.onRegister();
        }
        onSpawnOrPlay() {
            if (this.tarsInstance) {
                return;
            }
            if (!this.saveData) {
                this.saveData = (0, ITarsMod_1.getTarsMod)().initializeTarsSaveData();
            }
            this.tarsInstance = (0, ITarsMod_1.getTarsMod)().createAndLoadTars(this, this.saveData);
            if (this.tarsInstance.isEnabled()) {
                this.tarsInstance.toggle(true);
            }
        }
        onRemoved() {
            if (this.tarsInstance) {
                gameScreen?.dialogs.get((0, ITarsMod_1.getTarsMod)().dialogMain, this.tarsInstance.getDialogSubId())?.close();
                this.tarsInstance.disable(true);
                this.tarsInstance.unload();
                this.tarsInstance = undefined;
            }
            this.onDeregister();
        }
        onRegister() {
            if (!this.registered) {
                this.registered = true;
                EventManager_1.default.registerEventBusSubscriber(this);
            }
        }
        onDeregister() {
            if (this.registered) {
                this.registered = false;
                EventManager_1.default.deregisterEventBusSubscriber(this);
            }
        }
        onRenamed() {
            if (this.tarsInstance) {
                const dialog = gameScreen?.dialogs.get((0, ITarsMod_1.getTarsMod)().dialogMain, this.tarsInstance.getDialogSubId());
                if (dialog) {
                    dialog.refreshHeader();
                }
            }
        }
        onLoadedOnIsland() {
            (0, ITarsMod_1.getTarsMod)().event.emit("refreshTarsInstanceReferences");
        }
        onIslandActivated(island) {
            if (island.id === this.islandId) {
                this.onSpawnOrPlay();
            }
        }
        initializeStats() {
            const strength = this.island.seededRandom.int(45, 50);
            const stamina = this.island.seededRandom.int(70, 80);
            const hunger = this.island.seededRandom.int(15, 20);
            const thirst = this.island.seededRandom.int(15, 20);
            this.stat.setValue(IStats_1.Stat.Metabolism, 0);
            this.stat.setMax(IStats_1.Stat.Stamina, stamina, stamina);
            this.stat.setMax(IStats_1.Stat.Hunger, hunger, hunger);
            this.stat.setMax(IStats_1.Stat.Thirst, thirst, thirst);
            this.stat.setValue(IStats_1.Stat.Strength, strength);
            this.stat.setValue(IStats_1.Stat.Health, this.getMaxHealth());
        }
        getDefaultCustomization() {
            return (0, Customizations_1.generateRandomCustomization)(this.island.seededRandom);
        }
        getDefaultName() {
            return (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.NpcName)
                .addArgs(Translation_1.default.get(Dictionary_1.default.HumanName, HumanName_1.default.Full));
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
        (0, ISerializer_1.SaveProperty)()
    ], TarsNPC.prototype, "saveData", void 0);
    __decorate([
        Decorators_1.Bound,
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "spawn"),
        (0, EventManager_1.EventHandler)(Game_1.Game, "play"),
        (0, EventManager_1.EventHandler)(Game_1.Game, "playingEntityChange")
    ], TarsNPC.prototype, "onSpawnOrPlay", null);
    __decorate([
        Decorators_1.Bound,
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "removed"),
        (0, EventManager_1.EventHandler)(Game_1.Game, "stopPlay")
    ], TarsNPC.prototype, "onRemoved", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "reregister")
    ], TarsNPC.prototype, "onRegister", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "deregister")
    ], TarsNPC.prototype, "onDeregister", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "renamed")
    ], TarsNPC.prototype, "onRenamed", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(NPC_1.default, "loadedOnIsland")
    ], TarsNPC.prototype, "onLoadedOnIsland", null);
    __decorate([
        Decorators_1.Bound,
        (0, EventManager_1.EventHandler)(Island_1.default, "activated")
    ], TarsNPC.prototype, "onIslandActivated", null);
    exports.default = TarsNPC;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc05QQy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ucGMvVGFyc05QQy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7Ozs7Ozs7SUE0QkgsTUFBcUIsT0FBUSxTQUFRLGFBQUc7UUFVcEMsWUFBWSxFQUFXLEVBQUUsV0FBVyxFQUFjLEVBQUUsSUFBWSxDQUFDLEVBQUUsSUFBWSxDQUFDLEVBQUUsSUFBWSxDQUFDO1lBQzNGLEtBQUssQ0FBQyxJQUFBLHFCQUFVLEdBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBVDlCLGlCQUFZLEdBQVksSUFBSSxDQUFDO1lBTTlDLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFNdkIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLHFCQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFRLENBQUMsSUFBSSxHQUFHLGtCQUFRLENBQUMsS0FBSyxHQUFHLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUc1QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQU1NLGFBQWE7WUFDaEIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUVuQixPQUFPO2FBQ1Y7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLHFCQUFVLEdBQUUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2FBQ3pEO1lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFBLHFCQUFVLEdBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhFLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEM7UUFDTCxDQUFDO1FBS00sU0FBUztZQUNaLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbkIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQWEsSUFBQSxxQkFBVSxHQUFFLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztnQkFFMUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO2FBQ2pDO1lBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFHTSxVQUFVO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixzQkFBWSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEO1FBQ0wsQ0FBQztRQUdNLFlBQVk7WUFDZixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUN4QixzQkFBWSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25EO1FBQ0wsQ0FBQztRQUdNLFNBQVM7WUFDWixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ25CLE1BQU0sTUFBTSxHQUFHLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFhLElBQUEscUJBQVUsR0FBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hILElBQUksTUFBTSxFQUFFO29CQUNSLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztpQkFDMUI7YUFDSjtRQUNMLENBQUM7UUFHTSxnQkFBZ0I7WUFDbkIsSUFBQSxxQkFBVSxHQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFJTSxpQkFBaUIsQ0FBQyxNQUFjO1lBQ25DLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDeEI7UUFDTCxDQUFDO1FBRWtCLGVBQWU7WUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUdwRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRzlDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRWtCLHVCQUF1QjtZQUN0QyxPQUFPLElBQUEsNENBQTJCLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRWtCLGNBQWM7WUFDN0IsT0FBTyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUM3QyxPQUFPLENBQUMscUJBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQVUsQ0FBQyxTQUFTLEVBQUUsbUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFa0IsbUJBQW1CLENBQUMsU0FBb0I7WUFDdkQsUUFBUSxTQUFTLEVBQUU7Z0JBQ2YsS0FBSyxrQkFBUyxDQUFDLEtBQUs7b0JBQ2hCLE9BQU8sZ0JBQVEsQ0FBQyxrQkFBa0IsQ0FBQztnQkFFdkMsS0FBSyxrQkFBUyxDQUFDLElBQUk7b0JBQ2YsT0FBTyxnQkFBUSxDQUFDLHFCQUFxQixDQUFDO2FBQzdDO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQztRQUVrQixnQkFBZ0I7WUFDL0IsT0FBTyxnQkFBTSxDQUFDLE9BQU8sQ0FBQztRQUMxQixDQUFDO1FBRWtCLG1CQUFtQjtZQUNsQyxNQUFNLGNBQWMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsRUFBRSxpQkFBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWpHLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyx5QkFBZSxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNoSTtZQUVELGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFRLENBQUMsVUFBVSxFQUFFLGlCQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFNUYsT0FBTyxjQUFjLENBQUM7UUFDMUIsQ0FBQztRQUVlLE9BQU87WUFFbkIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVrQixTQUFTLENBQUMsUUFBa0IsRUFBRSxLQUFhLEVBQUUsS0FBYSxFQUFFLEtBQWE7WUFFeEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDYjtZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDYjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9FLElBQUksV0FBVyxJQUFJLGtDQUFjLEVBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDYjtZQUVELE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQztLQUNKO0lBNUttQjtRQUFmLElBQUEsMEJBQVksR0FBRTs2Q0FBeUM7SUFzQnhEO1FBSkMsa0JBQUs7UUFDTCxJQUFBLDhCQUFlLEVBQUMsYUFBRyxFQUFFLE9BQU8sQ0FBQztRQUM3QixJQUFBLDJCQUFZLEVBQUMsV0FBSSxFQUFFLE1BQU0sQ0FBQztRQUMxQixJQUFBLDJCQUFZLEVBQUMsV0FBSSxFQUFFLHFCQUFxQixDQUFDO2dEQWdCekM7SUFLRDtRQUhDLGtCQUFLO1FBQ0wsSUFBQSw4QkFBZSxFQUFDLGFBQUcsRUFBRSxTQUFTLENBQUM7UUFDL0IsSUFBQSwyQkFBWSxFQUFDLFdBQUksRUFBRSxVQUFVLENBQUM7NENBVzlCO0lBR0Q7UUFEQyxJQUFBLDhCQUFlLEVBQUMsYUFBRyxFQUFFLFlBQVksQ0FBQzs2Q0FNbEM7SUFHRDtRQURDLElBQUEsOEJBQWUsRUFBQyxhQUFHLEVBQUUsWUFBWSxDQUFDOytDQU1sQztJQUdEO1FBREMsSUFBQSw4QkFBZSxFQUFDLGFBQUcsRUFBRSxTQUFTLENBQUM7NENBUS9CO0lBR0Q7UUFEQyxJQUFBLDhCQUFlLEVBQUMsYUFBRyxFQUFFLGdCQUFnQixDQUFDO21EQUd0QztJQUlEO1FBRkMsa0JBQUs7UUFDTCxJQUFBLDJCQUFZLEVBQUMsZ0JBQU0sRUFBRSxXQUFXLENBQUM7b0RBS2pDO0lBakdMLDBCQWtMQyJ9