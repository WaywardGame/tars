var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/item/IItem", "game/entity/IHuman", "event/EventBuses", "event/EventManager", "../objectives/other/creature/TameCreatures", "../core/objective/IObjective", "../objectives/acquire/item/AcquireItem", "../objectives/analyze/AnalyzeInventory", "../objectives/core/Lambda", "../objectives/other/item/EquipItem"], function (require, exports, IItem_1, IHuman_1, EventBuses_1, EventManager_1, TameCreatures_1, IObjective_1, AcquireItem_1, AnalyzeInventory_1, Lambda_1, EquipItem_1) {
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
            if (context.inventory.knife === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneKnife), new AnalyzeInventory_1.default()]);
            }
            if (context.inventory.equipSword === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.WoodenSword), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.LeftHand)]);
            }
            if (context.inventory.equipShield === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.WoodenShield), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.RightHand)]);
            }
            const creatures = context.utilities.object.findTamableCreatures(context, "Tame", { type: this.creatureType, top: 10 });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RhbWVDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBa0JBLE1BQWEsZ0JBQWdCO1FBSXpCLFlBQTZCLFlBQTBCO1lBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUNwRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQzdDLE1BQU0sVUFBVSxHQUFxQyxFQUFFLENBQUM7WUFFeEQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ25GO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQzVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZIO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pIO1lBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZILElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDakQ7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztRQUdNLGNBQWMsQ0FBQyxRQUFrQixFQUFFLEtBQWE7WUFDbkQsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxZQUFZLElBQUksS0FBSyxLQUFLLFdBQVcsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QjtRQUNMLENBQUM7S0FDSjtJQUxHO1FBREMsSUFBQSwyQkFBWSxFQUFDLHFCQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQzswREFLeEM7SUE1Q0wsNENBNkNDIn0=