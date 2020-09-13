define(["require", "exports", "save/data/ISaveDataGlobal", "../../IObjective", "../../Objective"], function (require, exports, ISaveDataGlobal_1, IObjective_1, Objective_1) {
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
            if (context.player.options.dropOnDismantle) {
                this.log.info("Disabling DropOnDismantle");
                game.updateOption(context.player, "dropOnDismantle", false);
                return IObjective_1.ObjectiveResult.Pending;
            }
            if (context.player.options.dropLocation !== ISaveDataGlobal_1.DropLocation.Feet) {
                this.log.info("Setting DropLocation to Feet");
                game.updateOption(context.player, "dropLocation", ISaveDataGlobal_1.DropLocation.Feet);
                return IObjective_1.ObjectiveResult.Pending;
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = OptionsInterrupt;
    OptionsInterrupt.changedDropOnGatherHarvest = false;
    OptionsInterrupt.changedDropOnDismantle = false;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUtBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBSy9DLE1BQU0sQ0FBQyxPQUFPO1lBQ3BCLElBQUksZ0JBQWdCLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2hELGdCQUFnQixDQUFDLDBCQUEwQixHQUFHLEtBQUssQ0FBQztnQkFDcEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0Q7WUFFRCxJQUFJLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFO2dCQUM1QyxnQkFBZ0IsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3pEO1FBQ0YsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3RCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvRCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBUUQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxLQUFLLDhCQUFZLENBQUMsSUFBSSxFQUFFO2dCQUM5RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLDhCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7O0lBakVGLG1DQW1FQztJQWpFYywyQ0FBMEIsR0FBRyxLQUFLLENBQUM7SUFDbkMsdUNBQXNCLEdBQUcsS0FBSyxDQUFDIn0=