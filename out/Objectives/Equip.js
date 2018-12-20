var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../Objective", "./ExecuteAction"], function (require, exports, IAction_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Equip extends Objective_1.default {
        constructor(item, equip) {
            super();
            this.item = item;
            this.equip = equip;
        }
        getHashCode() {
            return `Equip:${this.item && this.item.getName(false).getString()}`;
        }
        onExecute(base) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.equip !== undefined) {
                    return new ExecuteAction_1.default(IAction_1.ActionType.Equip, action => action.execute(localPlayer, this.item, this.equip));
                }
                else {
                    return new ExecuteAction_1.default(IAction_1.ActionType.Unequip, action => action.execute(localPlayer, this.item));
                }
            });
        }
    }
    exports.default = Equip;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXF1aXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9FcXVpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLE1BQXFCLEtBQU0sU0FBUSxtQkFBUztRQUUzQyxZQUE2QixJQUFXLEVBQW1CLEtBQWlCO1lBQzNFLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUU1RSxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLFNBQVMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ3JFLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVzs7Z0JBQ2pDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQzdCLE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUssRUFBRSxJQUFJLENBQUMsS0FBTSxDQUFDLENBQUMsQ0FBQztpQkFFM0c7cUJBQU07b0JBQ04sT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUMsQ0FBQztpQkFDaEc7WUFDRixDQUFDO1NBQUE7S0FFRDtJQW5CRCx3QkFtQkMifQ==