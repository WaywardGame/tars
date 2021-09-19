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
        getStatus() {
            return undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBbUIvQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDakUsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksV0FBVyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3JILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELGdCQUFnQixDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFDOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFLTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUU7Z0JBQ3RDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdFO1lBRUQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBRTdCLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQTBCLEVBQUU7Z0JBQzlGLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksU0FBUyxFQUFFLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFRLENBQUMsQ0FBQztpQkFDaEc7YUFDRDtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQzs7SUFqRUYsbUNBbUVDO0lBL0RlLCtCQUFjLEdBQXNCO1FBQ2xELFVBQVUsRUFBRSxJQUFJO1FBQ2hCLGlCQUFpQixFQUFFLEtBQUs7UUFDeEIsVUFBVSxFQUFFLEtBQUs7UUFDakIsWUFBWSxFQUFFLDhCQUFZLENBQUMsSUFBSTtRQUMvQixlQUFlLEVBQUUsS0FBSztRQUN0QixtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLHNCQUFzQixFQUFFLEtBQUs7UUFDN0IscUJBQXFCLEVBQUUsS0FBSztRQUM1Qiw0QkFBNEIsRUFBRSxLQUFLO0tBQ25DLENBQUEifQ==