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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RhbWVDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBa0JBLE1BQWEsZ0JBQWdCO1FBSXpCLFlBQTZCLFlBQTBCO1lBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUNwRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQzdDLE1BQU0sVUFBVSxHQUFxQyxFQUFFLENBQUM7WUFFeEQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ25GO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQzVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZIO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pIO1lBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUM5RyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFHTSxjQUFjLENBQUMsUUFBa0IsRUFBRSxLQUFhO1lBQ25ELElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsWUFBWSxJQUFJLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkI7UUFDTCxDQUFDO0tBQ0o7SUFMRztRQURDLElBQUEsMkJBQVksRUFBQyxxQkFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7MERBS3hDO0lBNUNMLDRDQTZDQyJ9