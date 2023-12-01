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
define(["require", "exports", "@wayward/game/game/entity/action/IAction", "@wayward/game/language/Dictionary", "@wayward/game/language/ITranslation", "@wayward/game/language/Translation", "../../core/objective/Objective"], function (require, exports, IAction_1, Dictionary_1, ITranslation_1, Translation_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExecuteAction extends Objective_1.default {
        constructor(action, args, expectedMessages, expectedCannotUseResult) {
            super();
            this.action = action;
            this.args = args;
            this.expectedMessages = expectedMessages;
            this.expectedCannotUseResult = expectedCannotUseResult;
            this.includeUniqueIdentifierInHashCode = true;
        }
        getIdentifier() {
            return `ExecuteAction:${IAction_1.ActionType[this.action.type]}`;
        }
        getStatus() {
            return `Executing ${Translation_1.default.nameOf(Dictionary_1.default.Action, this.action.type).inContext(ITranslation_1.TextContext.Lowercase).getString()} action`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            return context.utilities.action.executeAction(context, this.action, this.args, this.expectedMessages, this.expectedCannotUseResult);
        }
        getBaseDifficulty(context) {
            return 1;
        }
    }
    exports.default = ExecuteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvRXhlY3V0ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFhSCxNQUFxQixhQUE4QyxTQUFRLG1CQUFTO1FBSW5GLFlBQ2tCLE1BQVMsRUFDVCxJQUEyQixFQUMzQixnQkFBK0IsRUFDL0IsdUJBQXlDO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBSlMsV0FBTSxHQUFOLE1BQU0sQ0FBRztZQUNULFNBQUksR0FBSixJQUFJLENBQXVCO1lBQzNCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBZTtZQUMvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWtCO1lBTi9CLHNDQUFpQyxHQUFZLElBQUksQ0FBQztRQVE5RSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixvQkFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSyxDQUFDLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQywwQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDcEksQ0FBQztRQUVlLFNBQVM7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNuQyxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUM7WUFFRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNySSxDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE9BQWdCO1lBQ3BELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQUNEO0lBbkNELGdDQW1DQyJ9