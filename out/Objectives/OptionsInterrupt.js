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
        getHashCode() {
            return "OptionsInterrupt";
        }
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
                if (localPlayer.options.protectedCraftingItemContainers) {
                    this.log.info("Disabling protectedCraftingItemContainers");
                    game.updateOption(localPlayer, "protectedCraftingItemContainers", false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL09wdGlvbnNJbnRlcnJ1cHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFLQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxXQUFXO1lBQ2pCLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO29CQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3BELE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7b0JBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMxRCxPQUFPO2lCQUNQO2dCQVFELElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRTtvQkFDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztvQkFDbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2hFLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFO29CQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO29CQUMzRCxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDekUsT0FBTztpQkFDUDtnQkFFRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLG9CQUFZLENBQUMsSUFBSSxFQUFFO29CQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsb0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbEUsT0FBTztpQkFDUDtnQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7U0FBQTtLQUVEO0lBOUNELG1DQThDQyJ9