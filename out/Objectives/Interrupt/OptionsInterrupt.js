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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBbUIvQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDakUsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksV0FBVyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3JILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELGdCQUFnQixDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFDOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUtNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDdEMsZ0JBQWdCLENBQUMsZUFBZSxHQUFHLGlCQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0U7WUFFRCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFFN0IsS0FBSyxNQUFNLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBMEIsRUFBRTtnQkFDOUYsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQ3JGLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQVEsQ0FBQyxDQUFDO2lCQUNoRzthQUNEO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDOztJQWpFRixtQ0FtRUM7SUEvRGUsK0JBQWMsR0FBc0I7UUFDbEQsVUFBVSxFQUFFLElBQUk7UUFDaEIsaUJBQWlCLEVBQUUsS0FBSztRQUN4QixVQUFVLEVBQUUsS0FBSztRQUNqQixZQUFZLEVBQUUsOEJBQVksQ0FBQyxJQUFJO1FBQy9CLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLG1CQUFtQixFQUFFLElBQUk7UUFDekIsc0JBQXNCLEVBQUUsS0FBSztRQUM3QixxQkFBcUIsRUFBRSxLQUFLO1FBQzVCLDRCQUE0QixFQUFFLEtBQUs7S0FDbkMsQ0FBQSJ9