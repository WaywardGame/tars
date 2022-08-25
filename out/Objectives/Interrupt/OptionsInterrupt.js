define(["require", "exports", "save/data/ISaveDataGlobal", "utilities/object/Objects", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, ISaveDataGlobal_1, Objects_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsInterrupt extends Objective_1.default {
        static restore(human) {
            const referenceId = human.referenceId;
            if (referenceId === undefined) {
                return;
            }
            const previousOptions = OptionsInterrupt.previousOptions.get(referenceId);
            if (!previousOptions) {
                return;
            }
            for (const key of Objects_1.default.keys(previousOptions)) {
                const optionValue = previousOptions[key];
                if ((typeof (optionValue) === "boolean" || typeof (optionValue) === "number") && optionValue !== human.options[key]) {
                    game.updateOption(human, key, optionValue);
                }
            }
            OptionsInterrupt.previousOptions.delete(referenceId);
        }
        getIdentifier() {
            return "OptionsInterrupt";
        }
        getStatus() {
            return "Updating options";
        }
        async execute(context) {
            if (context.human.referenceId !== undefined && !OptionsInterrupt.previousOptions.has(context.human.referenceId)) {
                OptionsInterrupt.previousOptions.set(context.human.referenceId, Objects_1.default.deepClone(context.human.options));
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
    OptionsInterrupt.previousOptions = new Map();
    OptionsInterrupt.desiredOptions = {
        autoAttack: true,
        autoPickup: false,
        dropIntoContainers: false,
        dropLocation: ISaveDataGlobal_1.DropLocation.Feet,
        dropOnDisassemble: true,
        dropOnDismantle: true,
        dropOnGatherHarvest: true,
        useAdjacentContainers: false,
        warnOnDangerousActions: false,
        warnWhenBreakingItems: false,
        warnWhenBreakingItemsOnCraft: false,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVVBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBcUIvQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQVk7WUFDakMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN0QyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLE9BQU87YUFDUDtZQUVELE1BQU0sZUFBZSxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDckIsT0FBTzthQUNQO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksV0FBVyxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3BILElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDM0M7YUFDRDtZQUVELGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUtNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ2hILGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzFHO1lBRUQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBRTdCLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQTBCLEVBQUU7Z0JBQzlGLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNwRixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksU0FBUyxFQUFFLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFRLENBQUMsQ0FBQztpQkFDL0Y7YUFDRDtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekQsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQzs7SUF6RUYsbUNBMkVDO0lBekVjLGdDQUFlLEdBQXNDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFckQsK0JBQWMsR0FBc0I7UUFDM0QsVUFBVSxFQUFFLElBQUk7UUFDaEIsVUFBVSxFQUFFLEtBQUs7UUFDakIsa0JBQWtCLEVBQUUsS0FBSztRQUN6QixZQUFZLEVBQUUsOEJBQVksQ0FBQyxJQUFJO1FBQy9CLGlCQUFpQixFQUFFLElBQUk7UUFDdkIsZUFBZSxFQUFFLElBQUk7UUFDckIsbUJBQW1CLEVBQUUsSUFBSTtRQUN6QixxQkFBcUIsRUFBRSxLQUFLO1FBQzVCLHNCQUFzQixFQUFFLEtBQUs7UUFDN0IscUJBQXFCLEVBQUUsS0FBSztRQUM1Qiw0QkFBNEIsRUFBRSxLQUFLO0tBQ25DLENBQUEifQ==