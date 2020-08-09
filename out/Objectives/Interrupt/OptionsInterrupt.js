define(["require", "exports", "entity/action/actions/Drop", "../../IObjective", "../../Objective"], function (require, exports, Drop_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsInterrupt extends Objective_1.default {
        static restore() {
            if (OptionsInterrupt.changedDropOnGatherHarvest) {
                OptionsInterrupt.changedDropOnGatherHarvest = false;
                game.updateOption(localPlayer, "dropOnGatherHarvest", false);
            }
            if (OptionsInterrupt.changedDropOnDismantle) {
                OptionsInterrupt.changedDropOnDismantle = false;
                game.updateOption(localPlayer, "dropOnDismantle", false);
            }
        }
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
            if (!context.player.options.dropOnGatherHarvest) {
                this.log.info("Enabling DropOnGatherHarvest");
                game.updateOption(context.player, "dropOnGatherHarvest", true);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (!context.player.options.dropOnDismantle) {
                this.log.info("Enabling DropOnDismantle");
                game.updateOption(context.player, "dropOnDismantle", true);
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
    OptionsInterrupt.changedDropOnGatherHarvest = false;
    OptionsInterrupt.changedDropOnDismantle = false;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU1BLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBSy9DLE1BQU0sQ0FBQyxPQUFPO1lBQ3BCLElBQUksZ0JBQWdCLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2hELGdCQUFnQixDQUFDLDBCQUEwQixHQUFHLEtBQUssQ0FBQztnQkFDcEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0Q7WUFFRCxJQUFJLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFO2dCQUM1QyxnQkFBZ0IsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3pEO1FBQ0YsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMs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