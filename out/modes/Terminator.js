define(["require", "exports", "game/entity/IHuman", "game/IGame", "../core/objective/IObjective", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/core/Lambda", "../objectives/other/creature/HuntCreatures", "../objectives/other/Idle", "../objectives/other/item/EquipItem", "../objectives/other/ReturnToBase", "../objectives/utility/OrganizeInventory"], function (require, exports, IHuman_1, IGame_1, IObjective_1, AcquireInventoryItem_1, Lambda_1, HuntCreatures_1, Idle_1, EquipItem_1, ReturnToBase_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminatorMode = void 0;
    class TerminatorMode {
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
            const creatures = context.utilities.object.findHuntableCreatures(context, "Terminator", { onlyHostile: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybWluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2Rlcy9UZXJtaW5hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFrQkEsTUFBYSxjQUFjO1FBSWhCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUVuRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7Z0JBQ2hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksbUJBQVMsQ0FBQyxrQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0YsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hHO1lBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQy9HLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDakQ7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksRUFBRSxDQUFDLENBQUM7WUFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFpQixFQUFFLENBQUMsQ0FBQztZQUV6QyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxnQkFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDMUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBRVA7cUJBQU07b0JBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQUksRUFBRSxDQUFDLENBQUM7aUJBQy9CO2FBQ0o7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBQ0o7SUF6Q0Qsd0NBeUNDIn0=