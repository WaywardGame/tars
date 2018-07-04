var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../Objective", "./ExecuteAction"], function (require, exports, Enums_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Equip extends Objective_1.default {
        constructor(item, equip) {
            super();
            this.item = item;
            this.equip = equip;
        }
        getHashCode() {
            return `Equip:${game.getName(this.item, Enums_1.SentenceCaseStyle.Title, false)}`;
        }
        onExecute(base) {
            return __awaiter(this, void 0, void 0, function* () {
                return new ExecuteAction_1.default(this.equip !== undefined ? Enums_1.ActionType.Equip : Enums_1.ActionType.Unequip, {
                    item: this.item,
                    equipSlot: this.equip
                });
            });
        }
    }
    exports.default = Equip;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXF1aXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9FcXVpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQU9BLFdBQTJCLFNBQVEsbUJBQVM7UUFFM0MsWUFBb0IsSUFBVyxFQUFVLEtBQWlCO1lBQ3pELEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztZQUFVLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFMUQsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx5QkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVc7O2dCQUNqQyxPQUFPLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsa0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGtCQUFVLENBQUMsT0FBTyxFQUFFO29CQUMxRixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLO2lCQUNyQixDQUFDLENBQUM7WUFDSixDQUFDO1NBQUE7S0FFRDtJQWpCRCx3QkFpQkMifQ==