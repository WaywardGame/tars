define(["require", "exports", "language/Dictionary", "language/Translation", "game/entity/action/actions/Butcher", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/MoveToTarget", "language/dictionary/Message"], function (require, exports, Dictionary_1, Translation_1, Butcher_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, Message_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ButcherCorpse extends Objective_1.default {
        constructor(corpse) {
            super();
            this.corpse = corpse;
        }
        getIdentifier() {
            return `ButcherCorpse:${this.corpse.id}`;
        }
        getStatus() {
            return `Butchering ${Translation_1.default.nameOf(Dictionary_1.default.Creature, this.corpse.type).getString()} corpse`;
        }
        async execute(context) {
            if (!this.corpse.isValid()) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tool = context.inventory.butcher;
            if (tool === undefined) {
                this.log.info("Missing butcher tool for corpse");
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tile = context.island.getTileFromPoint(this.corpse);
            if (tile.events !== undefined || tile.creature !== undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(this.corpse, true),
                new ExecuteAction_1.default(Butcher_1.default, [tool], new Set([Message_1.default.NothingHereToButcher]), IObjective_1.ObjectiveResult.Complete).setStatus(this),
            ];
        }
    }
    exports.default = ButcherCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0Y2hlckNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9CdXRjaGVyQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUVuRCxZQUE2QixNQUFjO1lBQzFDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFM0MsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sY0FBYyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDckcsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzNCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUN2QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Z0JBQ2pELE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUxRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUM3RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBSUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQ25DLElBQUksdUJBQWEsQ0FBQyxpQkFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxpQkFBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSw0QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7YUFDckgsQ0FBQztRQUNILENBQUM7S0FFRDtJQXZDRCxnQ0F1Q0MifQ==