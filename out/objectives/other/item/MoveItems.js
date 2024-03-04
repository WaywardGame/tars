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
define(["require", "exports", "@wayward/game/game/doodad/Doodad", "@wayward/game/game/entity/action/actions/MoveItem", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "@wayward/game/game/entity/action/actions/PickUpItem"], function (require, exports, Doodad_1, MoveItem_1, IObjective_1, Objective_1, ExecuteAction_1, PickUpItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItems extends Objective_1.default {
        constructor(itemOrItems, targetContainer, source) {
            super();
            this.targetContainer = targetContainer;
            this.source = source;
            this.items = itemOrItems ? (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]) : undefined;
        }
        getIdentifier() {
            return `MoveItems:${this.items?.join(",")}`;
        }
        getStatus() {
            const targetContainerName = Doodad_1.default.is(this.targetContainer) ? this.targetContainer.getName() : undefined;
            if (this.source) {
                const sourceName = Doodad_1.default.is(this.source) ? this.source.getName() : `(${this.source.x},${this.source.y},${this.source.z})`;
                return `Moving ${this.items?.join(",")} into ${targetContainerName} from ${sourceName}`;
            }
            return `Moving ${this.items?.join(",")} into ${targetContainerName}`;
        }
        async execute(context) {
            const items = this.items ?? [this.getAcquiredItem(context)];
            if (items.some(item => !item?.isValid)) {
                this.log.warn(`Invalid move item ${items}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (this.items?.some(item => item.containedWithin?.asTile)) {
                return new ExecuteAction_1.default(PickUpItem_1.default, () => {
                    if (items.every(item => item?.containedWithin === this.targetContainer)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    return [];
                }).setStatus(this);
            }
            return new ExecuteAction_1.default(MoveItem_1.default, () => {
                if (items.every(item => item?.containedWithin === this.targetContainer)) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                return [items, this.targetContainer];
            }).setStatus(this);
        }
        getBaseDifficulty() {
            return 1;
        }
    }
    exports.default = MoveItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBZ0JILE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUkvQyxZQUFZLFdBQXNDLEVBQW1CLGVBQTJCLEVBQW1CLE1BQTBCO1lBQzVJLEtBQUssRUFBRSxDQUFDO1lBRDRELG9CQUFlLEdBQWYsZUFBZSxDQUFZO1lBQW1CLFdBQU0sR0FBTixNQUFNLENBQW9CO1lBRzVJLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDbkcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLG1CQUFtQixHQUFHLGdCQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRXpHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixNQUFNLFVBQVUsR0FBRyxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFFM0gsT0FBTyxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLG1CQUFtQixTQUFTLFVBQVUsRUFBRSxDQUFDO1lBQ3pGLENBQUM7WUFFRCxPQUFPLFVBQVUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsbUJBQW1CLEVBQUUsQ0FBQztRQUN0RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2hDLENBQUM7WUFHRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUM1RCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxFQUFFLEdBQUcsRUFBRTtvQkFDekMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLGVBQWUsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQzt3QkFDekUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDakMsQ0FBQztvQkFFRCxPQUFPLEVBQTBDLENBQUM7Z0JBQ25ELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQWMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxlQUFlLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7b0JBQ3pFLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLENBQUM7Z0JBY0QsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxDQUE2QyxDQUFDO1lBQ2xGLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRWtCLGlCQUFpQjtZQUNuQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQXBFRCw0QkFvRUMifQ==