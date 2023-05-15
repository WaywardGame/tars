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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/entity/IHuman", "../core/objective/IObjective", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/core/Lambda", "../objectives/other/creature/TameCreatures", "../objectives/other/item/EquipItem"], function (require, exports, EventBuses_1, EventManager_1, IHuman_1, IObjective_1, AcquireInventoryItem_1, Lambda_1, TameCreatures_1, EquipItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TameCreatureMode = void 0;
    class TameCreatureMode {
        constructor(creatureType) {
            this.creatureType = creatureType;
        }
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(new AcquireInventoryItem_1.default("knife"));
            if (!context.options.lockEquipment) {
                objectives.push([new AcquireInventoryItem_1.default("equipSword"), new EquipItem_1.default(IHuman_1.EquipType.MainHand)]);
                objectives.push([new AcquireInventoryItem_1.default("equipShield"), new EquipItem_1.default(IHuman_1.EquipType.OffHand)]);
            }
            const creatures = context.utilities.object.findTamableCreatures(context, "Tame", { type: this.creatureType });
            if (creatures.length > 0) {
                objectives.push(new TameCreatures_1.default(creatures));
            }
            objectives.push(new Lambda_1.default(async () => {
                this.finished(true);
                return IObjective_1.ObjectiveResult.Complete;
            }));
            return objectives;
        }
        onCreatureTame(creature, owner) {
            if (creature.type === this.creatureType && owner === localPlayer) {
                this.finished(true);
            }
        }
    }
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Creatures, "tame")
    ], TameCreatureMode.prototype, "onCreatureTame", null);
    exports.TameCreatureMode = TameCreatureMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RhbWVDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7Ozs7Ozs7O0lBa0JILE1BQWEsZ0JBQWdCO1FBSXpCLFlBQTZCLFlBQTBCO1lBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUNwRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQzdDLE1BQU0sVUFBVSxHQUFxQyxFQUFFLENBQUM7WUFFeEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO2dCQUNoQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLG1CQUFTLENBQUMsa0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksbUJBQVMsQ0FBQyxrQkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNoRztZQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDOUcsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUNqRDtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO1FBR00sY0FBYyxDQUFDLFFBQWtCLEVBQUUsS0FBWTtZQUNsRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFlBQVksSUFBSSxLQUFLLEtBQUssV0FBVyxFQUFFO2dCQUM5RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0wsQ0FBQztLQUNKO0lBTFU7UUFETixJQUFBLDJCQUFZLEVBQUMscUJBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDOzBEQUt4QztJQXZDTCw0Q0F3Q0MifQ==