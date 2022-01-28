define(["require", "exports", "game/entity/action/IAction", "game/entity/IHuman", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/doodad/AcquireBuildMoveToFire", "./EquipItem", "./UseItem"], function (require, exports, IAction_1, IHuman_1, IObjective_1, Objective_1, AcquireBuildMoveToFire_1, EquipItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class IgniteItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `IgniteItem:${this.item}`;
        }
        getStatus() {
            return `Igniting ${this.item?.getName()}`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid()) {
                this.log.error("Invalid ignite item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.lit || !description.use?.includes(IAction_1.ActionType.Ignite)) {
                this.log.error(`Invalid ignite item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new AcquireBuildMoveToFire_1.default(),
                new EquipItem_1.default(IHuman_1.EquipType.Held, item),
                new UseItem_1.default(IAction_1.ActionType.Ignite, item),
            ];
        }
    }
    exports.default = IgniteItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWduaXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vSWduaXRlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsSUFBVztZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQURpQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsb0JBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQy9DLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxPQUFPO2dCQUNILElBQUksZ0NBQXNCLEVBQUU7Z0JBQzVCLElBQUksbUJBQVMsQ0FBQyxrQkFBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7Z0JBQ25DLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7YUFDdkMsQ0FBQztRQUNOLENBQUM7S0FFSjtJQWxDRCw2QkFrQ0MifQ==