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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBZUgsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBSS9DLFlBQVksV0FBc0MsRUFBbUIsZUFBMkIsRUFBbUIsTUFBMEI7WUFDNUksS0FBSyxFQUFFLENBQUM7WUFENEQsb0JBQWUsR0FBZixlQUFlLENBQVk7WUFBbUIsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7WUFHNUksSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNuRyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFFekcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sVUFBVSxHQUFHLGdCQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUUzSCxPQUFPLFVBQVUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsbUJBQW1CLFNBQVMsVUFBVSxFQUFFLENBQUM7WUFDekYsQ0FBQztZQUVELE9BQU8sVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3RFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDNUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDaEMsQ0FBQztZQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFjLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO29CQUN6RSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDO2dCQWNELE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBNkMsQ0FBQztZQUNsRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVrQixpQkFBaUI7WUFDbkMsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUF6REQsNEJBeURDIn0=