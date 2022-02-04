define(["require", "exports", "save/data/ISaveDataGlobal", "utilities/object/Objects", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, ISaveDataGlobal_1, Objects_1, IObjective_1, Objective_1) {
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
        getStatus() {
            return "Updating options";
        }
        async execute(context) {
            if (!context.human.asPlayer) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (!OptionsInterrupt.previousOptions) {
                OptionsInterrupt.previousOptions = Objects_1.default.deepClone(context.human.options);
            }
            const updated = [];
            for (const optionKey of Object.keys(OptionsInterrupt.desiredOptions)) {
                if (context.human.options[optionKey] !== OptionsInterrupt.desiredOptions[optionKey]) {
                    updated.push(`Updating ${optionKey}`);
                    game.updateOption(context.human, optionKey, OptionsInterrupt.desiredOptions[optionKey]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVVBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBbUIvQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDakUsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksV0FBVyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3JILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELGdCQUFnQixDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFDOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUtNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUM1QixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDdEMsZ0JBQWdCLENBQUMsZUFBZSxHQUFHLGlCQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUU7WUFFRCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFFN0IsS0FBSyxNQUFNLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBMEIsRUFBRTtnQkFDOUYsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQ3BGLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFlLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQVEsQ0FBQyxDQUFDO2lCQUN6RzthQUNEO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDOztJQXJFRixtQ0F1RUM7SUFuRXdCLCtCQUFjLEdBQXNCO1FBQzNELFVBQVUsRUFBRSxJQUFJO1FBQ2hCLGlCQUFpQixFQUFFLEtBQUs7UUFDeEIsVUFBVSxFQUFFLEtBQUs7UUFDakIsWUFBWSxFQUFFLDhCQUFZLENBQUMsSUFBSTtRQUMvQixlQUFlLEVBQUUsS0FBSztRQUN0QixtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLHNCQUFzQixFQUFFLEtBQUs7UUFDN0IscUJBQXFCLEVBQUUsS0FBSztRQUM1Qiw0QkFBNEIsRUFBRSxLQUFLO0tBQ25DLENBQUEifQ==