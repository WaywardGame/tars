define(["require", "exports", "Enums", "../Helpers", "../ITars", "../Objective", "./UseItem"], function (require, exports, Enums_1, Helpers, ITars_1, Objective_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Build extends Objective_1.default {
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
    exports.default = Build;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9CdWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxXQUEyQixTQUFRLG1CQUFTO1FBRTNDLFlBQW9CLElBQVc7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBRS9CLENBQUM7UUFFTSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCO1lBQ3JGLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNWLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFjLEVBQUUsSUFBVyxLQUFLLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZILEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxrQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pELENBQUM7UUFDRixDQUFDO0tBRUQ7SUFqQkQsd0JBaUJDIn0=