define(["require", "exports", "game/entity/IHuman", "game/entity/action/actions/Equip", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/ReserveItems"], function (require, exports, IHuman_1, Equip_1, IObjective_1, Objective_1, ExecuteAction_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EquipItem extends Objective_1.default {
        constructor(equip, item) {
            super();
            this.equip = equip;
            this.item = item;
        }
        getIdentifier() {
            return `EquipItem:${this.item}`;
        }
        getStatus() {
            return `Equipping ${this.item?.getName()} in slot ${IHuman_1.EquipType[this.equip]}`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid()) {
                this.log.error(`Invalid equip item. ${item} for ${IHuman_1.EquipType[this.equip]}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (item.isEquipped()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return [
                new ReserveItems_1.default(item).keepInInventory(),
                new ExecuteAction_1.default(Equip_1.default, [item, this.equip]).setStatus(this),
            ];
        }
    }
    exports.default = EquipItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXF1aXBJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9FcXVpcEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLEtBQWdCLEVBQW1CLElBQVc7WUFDMUUsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBVztZQUFtQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRTNFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxrQkFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzdFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxRQUFRLGtCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0UsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUN0QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO2dCQUN4QyxJQUFJLHVCQUFhLENBQUMsZUFBSyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7YUFDNUQsQ0FBQztRQUNILENBQUM7S0FFRDtJQS9CRCw0QkErQkMifQ==