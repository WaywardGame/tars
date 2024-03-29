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
define(["require", "exports", "language/Dictionary", "language/Translation", "game/entity/action/actions/Butcher", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/MoveToTarget", "language/dictionary/Message"], function (require, exports, Dictionary_1, Translation_1, Butcher_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, Message_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ButcherCorpse extends Objective_1.default {
        constructor(corpse) {
            super();
            this.corpse = corpse;
        }
        getIdentifier() {
            return `ButcherCorpse:${this.corpse.id}`;
        }
        getStatus() {
            return `Butchering ${Translation_1.default.nameOf(Dictionary_1.default.Creature, this.corpse.type).getString()} corpse`;
        }
        async execute(context) {
            if (!this.corpse.isValid()) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tool = context.inventory.butcher;
            if (tool === undefined) {
                this.log.info("Missing butcher tool for corpse");
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tile = this.corpse.tile;
            if (tile.events !== undefined || tile.creature !== undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(this.corpse, true),
                new ExecuteAction_1.default(Butcher_1.default, [tool], new Set([Message_1.default.NothingHereToButcher]), IObjective_1.ObjectiveResult.Complete).setStatus(this),
            ];
        }
    }
    exports.default = ButcherCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0Y2hlckNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9CdXRjaGVyQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWdCSCxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsTUFBYztZQUMxQyxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRTNDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDMUMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGNBQWMscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO1FBQ3JHLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUMzQixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFDdkMsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDN0QsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUlELE9BQU87Z0JBQ04sSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUNuQyxJQUFJLHVCQUFhLENBQUMsaUJBQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsaUJBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2FBQ3JILENBQUM7UUFDSCxDQUFDO0tBRUQ7SUF0Q0QsZ0NBc0NDIn0=