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
            for (const optionKey of Object.keys(OptionsInterrupt.desiredOptions)) {
                if (context.player.options[optionKey] !== OptionsInterrupt.desiredOptions[optionKey]) {
                    updated.push(`Updating ${optionKey}`);
                    game.updateOption(context.player, optionKey, OptionsInterrupt.desiredOptions[optionKey]);
                }
            }
            if (updated.length > 0) {
                this.log.info(`Updating options. ${updated.join(", ")}`);
                return IObjective_1.ObjectiveResult.Pending;
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = OptionsInterrupt;
    OptionsInterrupt.desiredOptions = {
        autoAttack: true,
        autoGatherHarvest: false,
        autoPickup: false,
        dropLocation: ISaveDataGlobal_1.DropLocation.Feet,
        dropOnDismantle: false,
        dropOnGatherHarvest: true,
        warnOnDangerousActions: false,
        warnWhenBreakingItems: false,
        warnWhenBreakingItemsOnCraft: false,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBbUIvQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDakUsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksV0FBVyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3JILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELGdCQUFnQixDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFDOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBS00sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFO2dCQUN0QyxnQkFBZ0IsQ0FBQyxlQUFlLEdBQUcsaUJBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM3RTtZQUVELE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztZQUU3QixLQUFLLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUEwQixFQUFFO2dCQUM5RixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBUSxDQUFDLENBQUM7aUJBQ2hHO2FBQ0Q7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7O0lBN0RGLG1DQStEQztJQTNEZSwrQkFBYyxHQUFzQjtRQUNsRCxVQUFVLEVBQUUsSUFBSTtRQUNoQixpQkFBaUIsRUFBRSxLQUFLO1FBQ3hCLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLFlBQVksRUFBRSw4QkFBWSxDQUFDLElBQUk7UUFDL0IsZUFBZSxFQUFFLEtBQUs7UUFDdEIsbUJBQW1CLEVBQUUsSUFBSTtRQUN6QixzQkFBc0IsRUFBRSxLQUFLO1FBQzdCLHFCQUFxQixFQUFFLEtBQUs7UUFDNUIsNEJBQTRCLEVBQUUsS0FBSztLQUNuQyxDQUFBIn0=