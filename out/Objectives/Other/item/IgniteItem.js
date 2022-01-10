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
            if (!(item === null || item === void 0 ? void 0 : item.isValid())) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWduaXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vSWduaXRlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsSUFBVztZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQURpQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVNLFNBQVM7O1lBQ1osT0FBTyxZQUFZLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxPQUFPLEVBQUUsQ0FBQSxFQUFFO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQSxNQUFBLFdBQVcsQ0FBQyxHQUFHLDBDQUFFLFFBQVEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBLEVBQUU7Z0JBQ25GLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHdCQUF3QixJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsT0FBTztnQkFDSCxJQUFJLGdDQUFzQixFQUFFO2dCQUM1QixJQUFJLG1CQUFTLENBQUMsa0JBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO2dCQUNuQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2FBQ3ZDLENBQUM7UUFDTixDQUFDO0tBRUo7SUFsQ0QsNkJBa0NDIn0=