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
            if (items.some(item => item.containedWithin?.asTile)) {
                return new ExecuteAction_1.default(PickUpItem_1.default, () => {
                    if (items.every(item => item.containedWithin === this.targetContainer)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    return [];
                }).setStatus(this);
            }
            const itemsByContainer = new Map();
            for (const item of items) {
                let containerItems = itemsByContainer.get(item.containedWithin);
                if (!containerItems) {
                    containerItems = [];
                    itemsByContainer.set(item.containedWithin, containerItems);
                }
                containerItems.push(item);
            }
            return Array.from(itemsByContainer.values()).map(containerItems => new ExecuteAction_1.default(MoveItem_1.default, () => {
                if (containerItems.every(item => item.containedWithin === this.targetContainer)) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                return [containerItems, this.targetContainer];
            }).setStatus(this));
        }
        getBaseDifficulty() {
            return 1;
        }
    }
    exports.default = MoveItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBZ0JILE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUkvQyxZQUFZLFdBQXNDLEVBQW1CLGVBQTJCLEVBQW1CLE1BQTBCO1lBQzVJLEtBQUssRUFBRSxDQUFDO1lBRDRELG9CQUFlLEdBQWYsZUFBZSxDQUFZO1lBQW1CLFdBQU0sR0FBTixNQUFNLENBQW9CO1lBRzVJLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDbkcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLG1CQUFtQixHQUFHLGdCQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRXpHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixNQUFNLFVBQVUsR0FBRyxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFFM0gsT0FBTyxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLG1CQUFtQixTQUFTLFVBQVUsRUFBRSxDQUFDO1lBQ3pGLENBQUM7WUFFRCxPQUFPLFVBQVUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsbUJBQW1CLEVBQUUsQ0FBQztRQUN0RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBVyxDQUFDO1lBQ3RFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2hDLENBQUM7WUFHRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3RELE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLEVBQUUsR0FBRyxFQUFFO29CQUN6QyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO3dCQUN4RSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNqQyxDQUFDO29CQUVELE9BQU8sRUFBMEMsQ0FBQztnQkFDbkQsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BCLENBQUM7WUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1lBRW5FLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQzFCLElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDckIsY0FBYyxHQUFHLEVBQUUsQ0FBQTtvQkFDbkIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQzVELENBQUM7Z0JBRUQsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsSUFBSSx1QkFBYSxDQUFDLGtCQUFjLEVBQUUsR0FBRyxFQUFFO2dCQUN6RyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO29CQUNqRixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDO2dCQWNELE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBNkMsQ0FBQztZQUMzRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRWtCLGlCQUFpQjtZQUNuQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQWhGRCw0QkFnRkMifQ==