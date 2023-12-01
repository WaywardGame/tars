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
define(["require", "exports", "@wayward/game/game/doodad/Doodad", "@wayward/game/game/entity/action/actions/MoveItem", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction"], function (require, exports, Doodad_1, MoveItem_1, IObjective_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItem extends Objective_1.default {
        constructor(item, targetContainer, source) {
            super();
            this.item = item;
            this.targetContainer = targetContainer;
            this.source = source;
        }
        getIdentifier() {
            return `MoveItem:${this.item}`;
        }
        getStatus() {
            if (Doodad_1.default.is(this.source)) {
                return `Moving ${this.item?.getName()} into the inventory from ${this.source.getName()}`;
            }
            return `Moving ${this.item?.getName()} into the inventory from (${this.source.x},${this.source.y},${this.source.z})`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid) {
                this.log.warn(`Invalid move item ${item}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            return new ExecuteAction_1.default(MoveItem_1.default, () => {
                if (item.containedWithin === this.targetContainer) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                return [item, this.targetContainer];
            }).setStatus(this);
        }
        getBaseDifficulty() {
            return 1;
        }
    }
    exports.default = MoveItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL01vdmVJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWVILE1BQXFCLFFBQVMsU0FBUSxtQkFBUztRQUU5QyxZQUE2QixJQUFzQixFQUFtQixlQUEyQixFQUFtQixNQUF5QjtZQUM1SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFrQjtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBWTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUU3SSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxVQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLDRCQUE0QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDMUYsQ0FBQztZQUVELE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSw2QkFBNkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUN0SCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzNDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDaEMsQ0FBQztZQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFjLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUNuRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDO2dCQVVELE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBNkMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVrQixpQkFBaUI7WUFDbkMsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUE3Q0QsMkJBNkNDIn0=