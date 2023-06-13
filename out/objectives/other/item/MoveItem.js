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
define(["require", "exports", "game/doodad/Doodad", "game/entity/action/actions/MoveItem", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction"], function (require, exports, Doodad_1, MoveItem_1, IObjective_1, Objective_1, ExecuteAction_1) {
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
            if (!item?.isValid()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL01vdmVJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWVILE1BQXFCLFFBQVMsU0FBUSxtQkFBUztRQUU5QyxZQUE2QixJQUFzQixFQUFtQixlQUEyQixFQUFtQixNQUF5QjtZQUM1SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFrQjtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBWTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUU3SSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2FBQ3pGO1lBRUQsT0FBTyxVQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLDZCQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3RILENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFjLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDbEQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBVUQsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUEyQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRWtCLGlCQUFpQjtZQUNuQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQTdDRCwyQkE2Q0MifQ==