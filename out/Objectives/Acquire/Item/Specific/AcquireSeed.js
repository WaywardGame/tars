define(["require", "exports", "../../../../Objective", "../../../../utilities/Item", "../AcquireItem"], function (require, exports, Objective_1, Item_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireSeed extends Objective_1.default {
        getIdentifier() {
            return "AcquireSeed";
        }
        getStatus() {
            return "Acquiring a seed";
        }
        async execute(context) {
            return Array.from(Item_1.itemUtilities.seedItemTypes).map(itemType => [new AcquireItem_1.default(itemType, { requiredMinDur: 1 }).passAcquireData(this)]);
        }
    }
    exports.default = AcquireSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vc3BlY2lmaWMvQWNxdWlyZVNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRXZDLGFBQWE7WUFDaEIsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLGtCQUFrQixDQUFDO1FBQzlCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0ksQ0FBQztLQUVKO0lBZEQsOEJBY0MifQ==