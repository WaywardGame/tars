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
define(["require", "exports", "@wayward/game/event/EventBuses", "@wayward/game/event/EventManager", "@wayward/game/game/entity/IHuman", "../core/objective/IObjective", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/core/Lambda", "../objectives/other/creature/TameCreatures", "../objectives/other/item/EquipItem"], function (require, exports, EventBuses_1, EventManager_1, IHuman_1, IObjective_1, AcquireInventoryItem_1, Lambda_1, TameCreatures_1, EquipItem_1) {
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
            if (creature.type === this.creatureType && owner.isLocalPlayer) {
                this.finished(true);
            }
        }
    }
    exports.TameCreatureMode = TameCreatureMode;
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Creatures, "tame")
    ], TameCreatureMode.prototype, "onCreatureTame", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RhbWVDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7Ozs7Ozs7O0lBa0JILE1BQWEsZ0JBQWdCO1FBSTVCLFlBQTZCLFlBQTBCO1lBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUN2RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQ2hELE1BQU0sVUFBVSxHQUFxQyxFQUFFLENBQUM7WUFFeEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksbUJBQVMsQ0FBQyxrQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0YsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlGLENBQUM7WUFFRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQzlHLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFHTSxjQUFjLENBQUMsUUFBa0IsRUFBRSxLQUFZO1lBQ3JELElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBeENELDRDQXdDQztJQUxPO1FBRE4sSUFBQSwyQkFBWSxFQUFDLHFCQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQzswREFLeEMifQ==