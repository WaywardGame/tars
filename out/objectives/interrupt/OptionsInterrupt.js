/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/save/data/ISaveDataGlobal", "@wayward/utilities/object/Objects", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, ISaveDataGlobal_1, Objects_1, IObjective_1, Objective_1) {
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
    exports.default = OptionsInterrupt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc0ludGVycnVwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9PcHRpb25zSW50ZXJydXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQVlILE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBcUIvQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQVk7WUFDakMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN0QyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDL0IsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdEIsT0FBTztZQUNSLENBQUM7WUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pELE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLFdBQVcsS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3JILElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztZQUNGLENBQUM7WUFFRCxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFLTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pILGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFtQixDQUFDLENBQUMsQ0FBQztZQUN2SCxDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBRTdCLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQTBCLEVBQUUsQ0FBQztnQkFDL0YsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBUSxDQUFDLENBQUM7Z0JBQ2hHLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDaEMsQ0FBQztZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQzs7SUF2RWEsZ0NBQWUsR0FBc0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVyRCwrQkFBYyxHQUFzQjtRQUMzRCxVQUFVLEVBQUUsSUFBSTtRQUNoQixVQUFVLEVBQUUsS0FBSztRQUNqQixrQkFBa0IsRUFBRSxLQUFLO1FBQ3pCLFlBQVksRUFBRSw4QkFBWSxDQUFDLElBQUk7UUFDL0IsaUJBQWlCLEVBQUUsSUFBSTtRQUN2QixlQUFlLEVBQUUsSUFBSTtRQUNyQixtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLHFCQUFxQixFQUFFLEtBQUs7UUFDNUIsc0JBQXNCLEVBQUUsS0FBSztRQUM3QixxQkFBcUIsRUFBRSxLQUFLO1FBQzVCLDRCQUE0QixFQUFFLEtBQUs7S0FDbkMsQ0FBQTtzQkFoQm1CLGdCQUFnQiJ9