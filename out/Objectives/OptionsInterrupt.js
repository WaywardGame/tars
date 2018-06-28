var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective"], function (require, exports, Enums_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsInterrupt extends Objective_1.default {
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                if (localPlayer.options.autoPickup) {
                    this.log.info("Disabling AutoPickup");
                    game.updateOption(localPlayer, "autoPickup", false);
                    return;
                }
                if (!localPlayer.options.autoGatherHarvest) {
                    this.log.info("Enabling AutoGatherHarvest");
                    game.updateOption(localPlayer, "autoGatherHarvest", true);
                    return;
                }
                if (localPlayer.options.protectedCraftingItems) {
                    this.log.info("Disabling ProtectedCraftingItems");
                    game.updateOption(localPlayer, "protectedCraftingItems", false);
                    return;
                }
                if (localPlayer.options.dropLocation !== Enums_1.DropLocation.Feet) {
                    this.log.info("Setting DropLocation to Feet");
                    game.updateOption(localPlayer, "dropLocation", Enums_1.DropLocation.Feet);
                    return;
                }
                return IObjective_1.ObjectiveStatus.Complete;
            });
        }
    }
    exports.default = OptionsInterrupt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL09wdGlvbnNJbnRlcnJ1cHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFLQSxzQkFBc0MsU0FBUSxtQkFBUztRQUV6QyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNwRCxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO29CQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDMUQsT0FBTztpQkFDUDtnQkFRRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUU7b0JBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7b0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNoRSxPQUFPO2lCQUNQO2dCQUVELElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEtBQUssb0JBQVksQ0FBQyxJQUFJLEVBQUU7b0JBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxvQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRSxPQUFPO2lCQUNQO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztTQUFBO0tBRUQ7SUFwQ0QsbUNBb0NDIn0=