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
            const updated = [];
            if (context.player.options.autoPickup) {
                updated.push("Disabling AutoPickup");
                game.updateOption(context.player, "autoPickup", false);
            }
            if (context.player.options.autoGatherHarvest) {
                updated.push("Disabling AutoGatherHarvest");
                game.updateOption(context.player, "autoGatherHarvest", false);
            }
            if (!context.player.options.autoAttack) {
                updated.push("Enabling AutoAttack");
                game.updateOption(context.player, "autoAttack", true);
            }
            if (!context.player.options.dropOnGatherHarvest) {
                updated.push("Enabling DropOnGatherHarvest");
                game.updateOption(context.player, "dropOnGatherHarvest", true);
            }
            if (context.player.options.dropOnDismantle) {
                updated.push("Disabling DropOnDismantle");
                game.updateOption(context.player, "dropOnDismantle", false);
            }
            if (context.player.options.dropLocation !== ISaveDataGlobal_1.DropLocation.Feet) {
                updated.push("Setting DropLocation to Feet");
                game.updateOption(context.player, "dropLocation", ISaveDataGlobal_1.DropLocation.Feet);
            }
            if (updated.length > 0) {
                this.log.info(`Updating options. ${updated.join(", ")}`);
                return IObjective_1.ObjectiveResult.Pending;
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = OptionsInterrupt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBTy9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBYztZQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFO2dCQUN0QyxPQUFPO2FBQ1A7WUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUNqRSxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxRQUFRLENBQUMsSUFBSSxXQUFXLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDckgsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2lCQUM1QzthQUNEO1lBRUQsZ0JBQWdCLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFLTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUU7Z0JBQ3RDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdFO1lBRUQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBRTdCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDdkQ7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO2dCQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM5RDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN0RDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtnQkFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDL0Q7WUFPRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtnQkFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDNUQ7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksS0FBSyw4QkFBWSxDQUFDLElBQUksRUFBRTtnQkFDOUQsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLDhCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7S0FFRDtJQS9FRCxtQ0ErRUMifQ==