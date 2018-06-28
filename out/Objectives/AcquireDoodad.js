define(["require", "exports", "Enums", "../Helpers", "../ITars", "../Objective", "./UseItem"], function (require, exports, Enums_1, Helpers, ITars_1, Objective_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForDoodad extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        onExecute(base, inventory, calculateDifficulty) {
            if (calculateDifficulty) {
                return 1;
            }
            const moveResult = Helpers.findAndMoveToTarget((point, tile) => Helpers.isOpenArea(base, point, tile));
            if (moveResult === ITars_1.MoveResult.Complete) {
                return new UseItem_1.default(this.item, Enums_1.ActionType.Build);
            }
        }
    }
    exports.default = AcquireItemForDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0FjcXVpcmVEb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsMEJBQTBDLFNBQVEsbUJBQVM7UUFFdkQsWUFBb0IsSUFBVztZQUMzQixLQUFLLEVBQUUsQ0FBQztZQURRLFNBQUksR0FBSixJQUFJLENBQU87UUFFL0IsQ0FBQztRQUVNLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7WUFDbEYsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQWMsRUFBRSxJQUFXLEtBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkgsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGtCQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEQsQ0FBQztRQUNMLENBQUM7S0FFSjtJQWpCRCx1Q0FpQkMifQ==