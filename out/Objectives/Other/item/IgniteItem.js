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
            var _a;
            return `Igniting ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            var _a, _b;
            const item = (_a = this.item) !== null && _a !== void 0 ? _a : this.getAcquiredItem(context);
            if (!item) {
                this.log.error("Invalid ignite item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.lit || !((_b = description.use) === null || _b === void 0 ? void 0 : _b.includes(IAction_1.ActionType.Ignite))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWduaXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vSWduaXRlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsSUFBVztZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQURpQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVNLFNBQVM7O1lBQ1osT0FBTyxZQUFZLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDdEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUEsTUFBQSxXQUFXLENBQUMsR0FBRywwQ0FBRSxRQUFRLENBQUMsb0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQSxFQUFFO2dCQUNuRixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDL0MsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE9BQU87Z0JBQ0gsSUFBSSxnQ0FBc0IsRUFBRTtnQkFDNUIsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDbkMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQzthQUN2QyxDQUFDO1FBQ04sQ0FBQztLQUVKO0lBbENELDZCQWtDQyJ9