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
            const targetContainerName = Doodad_1.default.is(this.targetContainer) ? this.targetContainer.getName() : undefined;
            if (this.source) {
                const sourceName = Doodad_1.default.is(this.source) ? this.source.getName() : `(${this.source.x},${this.source.y},${this.source.z})`;
                return `Moving ${this.item?.getName()} into ${targetContainerName} from ${sourceName}`;
            }
            return `Moving ${this.item?.getName()} into ${targetContainerName}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL01vdmVJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWVILE1BQXFCLFFBQVMsU0FBUSxtQkFBUztRQUU5QyxZQUE2QixJQUFzQixFQUFtQixlQUEyQixFQUFtQixNQUEwQjtZQUM3SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFrQjtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBWTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFvQjtRQUU5SSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ2YsTUFBTSxtQkFBbUIsR0FBRyxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUV6RyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxVQUFVLEdBQUcsZ0JBQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBRTNILE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLG1CQUFtQixTQUFTLFVBQVUsRUFBRSxDQUFDO1lBQ3hGLENBQUM7WUFFRCxPQUFPLFVBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3JFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxDQUFDO1lBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQWMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ25ELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLENBQUM7Z0JBVUQsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUE2QyxDQUFDO1lBQ2pGLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRWtCLGlCQUFpQjtZQUNuQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQWpERCwyQkFpREMifQ==