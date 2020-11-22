define(["require", "exports", "entity/action/IAction", "../../IContext", "../../IObjective", "../../Objective", "../Core/ExecuteAction"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Equip extends Objective_1.default {
        constructor(equip, item) {
            super();
            this.equip = equip;
            this.item = item;
        }
        getIdentifier() {
            return `Equip:${this.item}`;
        }
        getStatus() {
            var _a;
            return `Equipping ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            const item = this.item || context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (item.isEquipped()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Equip, (context, action) => {
                action.execute(context.player, item, this.equip);
            });
        }
    }
    exports.default = Equip;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXF1aXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9PdGhlci9FcXVpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixLQUFNLFNBQVEsbUJBQVM7UUFFM0MsWUFBNkIsS0FBZ0IsRUFBbUIsSUFBVztZQUMxRSxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFXO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU87UUFFM0UsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLGFBQWEsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzVDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBRUQ7SUE3QkQsd0JBNkJDIn0=