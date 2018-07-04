var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../Objective", "./AcquireItem"], function (require, exports, Enums_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireWaterContainer extends Objective_1.default {
        getHashCode() {
            return "AcquireWaterContainer";
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.pickEasiestObjective(base, inventory, [
                    [new AcquireItem_1.default(Enums_1.ItemType.Waterskin)],
                    [new AcquireItem_1.default(Enums_1.ItemType.ClayJug)],
                    [new AcquireItem_1.default(Enums_1.ItemType.GlassBottle)]
                ]);
            });
        }
    }
    exports.default = AcquireWaterContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZVdhdGVyQ29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBTUEsMkJBQTJDLFNBQVEsbUJBQVM7UUFFcEQsV0FBVztZQUNqQixPQUFPLHVCQUF1QixDQUFDO1FBQ2hDLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtvQkFDakQsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDbkMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDdkMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBRUQ7SUFkRCx3Q0FjQyJ9