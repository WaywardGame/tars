define(["require", "exports", "game/IGame", "game/item/IItem", "game/entity/IHuman", "../core/objective/IObjective", "../objectives/acquire/item/AcquireItem", "../objectives/analyze/AnalyzeInventory", "../objectives/core/Lambda", "../objectives/other/Idle", "../objectives/other/ReturnToBase", "../objectives/utility/OrganizeInventory", "../objectives/other/item/EquipItem", "../objectives/other/creature/HuntCreatures"], function (require, exports, IGame_1, IItem_1, IHuman_1, IObjective_1, AcquireItem_1, AnalyzeInventory_1, Lambda_1, Idle_1, ReturnToBase_1, OrganizeInventory_1, EquipItem_1, HuntCreatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminatorMode = void 0;
    class TerminatorMode {
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
            const creatures = context.utilities.object.findHuntableCreatures(context, "Terminator", { onlyHostile: true, top: 10 });
            if (creatures.length > 0) {
                objectives.push(new HuntCreatures_1.default(creatures));
            }
            objectives.push(new ReturnToBase_1.default());
            objectives.push(new OrganizeInventory_1.default());
            if (!multiplayer.isConnected()) {
                if (game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished(true);
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
                else {
                    objectives.push(new Idle_1.default());
                }
            }
            return objectives;
        }
    }
    exports.TerminatorMode = TerminatorMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybWluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2Rlcy9UZXJtaW5hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFvQkEsTUFBYSxjQUFjO1FBSWhCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDdkMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkY7WUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDNUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsRUFBRSxJQUFJLG1CQUFTLENBQUMsa0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkg7WUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDN0MsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsRUFBRSxJQUFJLG1CQUFTLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekg7WUFFRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4SCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLEVBQUUsQ0FBQyxDQUFDO1lBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBaUIsRUFBRSxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssZ0JBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQzFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUVQO3FCQUFNO29CQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMvQjthQUNKO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUNKO0lBOUNELHdDQThDQyJ9