define(["require", "exports", "entity/action/actions/Drop", "../../IObjective", "../../Objective"], function (require, exports, Drop_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsInterrupt extends Objective_1.default {
        getIdentifier() {
            return "OptionsInterrupt";
        }
        async execute(context) {
            if (context.player.options.autoPickup) {
                this.log.info("Disabling AutoPickup");
                game.updateOption(context.player, "autoPickup", false);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (!context.player.options.autoGatherHarvest) {
                this.log.info("Enabling AutoGatherHarvest");
                game.updateOption(context.player, "autoGatherHarvest", true);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (!context.player.options.autoAttack) {
                this.log.info("Enabling AutoAttack");
                game.updateOption(context.player, "autoAttack", true);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (context.player.options.protectedCraftingItems) {
                this.log.info("Disabling ProtectedCraftingItems");
                game.updateOption(context.player, "protectedCraftingItems", false);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (context.player.options.protectedCraftingItemContainers) {
                this.log.info("Disabling protectedCraftingItemContainers");
                game.updateOption(context.player, "protectedCraftingItemContainers", false);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (context.player.options.dropLocation !== Drop_1.DropLocation.Feet) {
                this.log.info("Setting DropLocation to Feet");
                game.updateOption(context.player, "dropLocation", Drop_1.DropLocation.Feet);
                return IObjective_1.ObjectiveResult.Pending;
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = OptionsInterrupt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU1BLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRS9DLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3RCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQVFELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbkUsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUU7Z0JBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUUsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLG1CQUFZLENBQUMsSUFBSSxFQUFFO2dCQUM5RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLG1CQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7S0FFRDtJQXBERCxtQ0FvREMifQ==