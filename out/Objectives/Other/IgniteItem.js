define(["require", "exports", "game/entity/action/IAction", "game/entity/IHuman", "../../IContext", "../../IObjective", "../../Objective", "../acquire/doodad/AcquireBuildMoveToFire", "./Equip", "./UseItem"], function (require, exports, IAction_1, IHuman_1, IContext_1, IObjective_1, Objective_1, AcquireBuildMoveToFire_1, Equip_1, UseItem_1) {
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
            var _a;
            const item = this.item || context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                this.log.error("Invalid ignite item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.lit || !((_a = description.use) === null || _a === void 0 ? void 0 : _a.includes(IAction_1.ActionType.Ignite))) {
                this.log.error("Invalid ignite item", item);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new AcquireBuildMoveToFire_1.default(),
                new Equip_1.default(IHuman_1.EquipType.Held, item),
                new UseItem_1.default(IAction_1.ActionType.Ignite, item),
            ];
        }
    }
    exports.default = IgniteItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWduaXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL0lnbml0ZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLElBQVc7WUFDcEMsS0FBSyxFQUFFLENBQUM7WUFEaUIsU0FBSSxHQUFKLElBQUksQ0FBTztRQUV4QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGNBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFFTSxTQUFTOztZQUNaLE9BQU8sWUFBWSxNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDUCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQSxNQUFBLFdBQVcsQ0FBQyxHQUFHLDBDQUFFLFFBQVEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBLEVBQUU7Z0JBQ25GLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsT0FBTztnQkFDSCxJQUFJLGdDQUFzQixFQUFFO2dCQUM1QixJQUFJLGVBQUssQ0FBQyxrQkFBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7Z0JBQy9CLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7YUFDdkMsQ0FBQztRQUNOLENBQUM7S0FFSjtJQWxDRCw2QkFrQ0MifQ==