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
define(["require", "exports", "game/entity/action/IAction", "language/Dictionary", "language/ITranslation", "language/Translation", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/ReserveItems"], function (require, exports, IAction_1, Dictionary_1, ITranslation_1, Translation_1, IObjective_1, Objective_1, ExecuteAction_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UseItem extends Objective_1.default {
        constructor(action, item) {
            super();
            this.action = action;
            this.item = item;
        }
        getIdentifier() {
            return `UseItem:${this.item}:${IAction_1.ActionType[this.action.type]}`;
        }
        getStatus() {
            return `Using ${typeof (this.item) === "string" ? this.item : this.item?.getName()} for ${Translation_1.default.nameOf(Dictionary_1.default.Action, this.action.type).inContext(ITranslation_1.TextContext.Lowercase).getString()} action`;
        }
        async execute(context) {
            const actionType = this.action.type;
            let item = typeof (this.item) === "string" ? context.inventory[this.item] : this.item ?? this.getAcquiredItem(context);
            if (Array.isArray(item)) {
                item = item[0];
            }
            if (!item?.isValid()) {
                this.log.warn(`Invalid use item for action ${IAction_1.ActionType[actionType]}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description;
            if (!description || !description.use || !description.use.includes(actionType)) {
                this.log.warn(`Invalid use item for action ${IAction_1.ActionType[actionType]}. Item ${item} is missing that action type`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            return [
                new ReserveItems_1.default(item).keepInInventory(),
                new ExecuteAction_1.default(this.action, [item]).setStatus(this),
            ];
        }
    }
    exports.default = UseItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vVXNlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFzQkgsTUFBcUIsT0FBNkMsU0FBUSxtQkFBUztRQUVsRixZQUE2QixNQUFTLEVBQW1CLElBQW1DO1lBQzNGLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQUc7WUFBbUIsU0FBSSxHQUFKLElBQUksQ0FBK0I7UUFFNUYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxXQUFXLElBQUksQ0FBQyxJQUFJLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUssQ0FBQyxFQUFFLENBQUM7UUFDaEUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsMEJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO1FBQzFNLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSyxDQUFDO1lBRXJDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZILElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNmO1lBRUQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLG9CQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RSxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0Isb0JBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxJQUFJLDhCQUE4QixDQUFDLENBQUM7Z0JBQ2pILE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxPQUFPO2dCQUNOLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7Z0JBQ3hDLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2FBQzdELENBQUM7UUFDSCxDQUFDO0tBRUQ7SUF2Q0QsMEJBdUNDIn0=