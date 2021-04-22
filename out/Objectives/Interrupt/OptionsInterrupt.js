define(["require", "exports", "save/data/ISaveDataGlobal", "utilities/object/Objects", "../../IObjective", "../../Objective"], function (require, exports, ISaveDataGlobal_1, Objects_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsInterrupt extends Objective_1.default {
        static restore(player) {
            if (!OptionsInterrupt.previousOptions) {
                return;
            }
            for (const key of Objects_1.default.keys(OptionsInterrupt.previousOptions)) {
                const optionValue = OptionsInterrupt.previousOptions[key];
                if ((typeof (optionValue) === "boolean" || typeof (optionValue) === "number") && optionValue !== player.options[key]) {
                    game.updateOption(player, key, optionValue);
                }
            }
            OptionsInterrupt.previousOptions = undefined;
        }
        getIdentifier() {
            return "OptionsInterrupt";
        }
        async execute(context) {
            if (!OptionsInterrupt.previousOptions) {
                OptionsInterrupt.previousOptions = Objects_1.default.deepClone(context.player.options);
            }
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBTy9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBYztZQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFO2dCQUN0QyxPQUFPO2FBQ1A7WUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUNqRSxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxRQUFRLENBQUMsSUFBSSxXQUFXLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDckgsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2lCQUM1QzthQUNEO1lBRUQsZ0JBQWdCLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFLTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUU7Z0JBQ3RDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdFO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0QsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3RELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0QsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQVFELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksS0FBSyw4QkFBWSxDQUFDLElBQUksRUFBRTtnQkFDOUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSw4QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRSxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDO0tBRUQ7SUEvRUQsbUNBK0VDIn0=