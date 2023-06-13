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
define(["require", "exports", "game/item/IItem", "game/entity/IStats", "game/entity/action/actions/RubCounterClockwise", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../AcquireItem", "../../../contextData/SetContextData", "../../../core/ExecuteAction", "../../../core/ReserveItems"], function (require, exports, IItem_1, IStats_1, RubCounterClockwise_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireUseOrbOfInfluence extends Objective_1.default {
        constructor() {
            super(...arguments);
            this.ignoreInvalidPlans = true;
        }
        getIdentifier() {
            return "AcquireUseOrbOfInfluence";
        }
        getStatus() {
            return "Acquiring and using an orb of influence";
        }
        async execute(context) {
            const malign = context.human.stat.get(IStats_1.Stat.Malignity);
            if (malign.value < 5000) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const itemContextDataKey = this.getUniqueContextDataKey("OrbOfInfluence");
            const objectives = [];
            const orbOfInfluenceItem = context.utilities.item.getItemInInventory(context, IItem_1.ItemType.OrbOfInfluence);
            if (orbOfInfluenceItem) {
                objectives.push(new ReserveItems_1.default(orbOfInfluenceItem));
                objectives.push(new SetContextData_1.default(itemContextDataKey, orbOfInfluenceItem));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.OrbOfInfluence).passAcquireData(this).setContextDataKey(itemContextDataKey));
            }
            objectives.push(new ExecuteAction_1.default(RubCounterClockwise_1.default, (context) => {
                const item = context.getData(itemContextDataKey);
                if (!item?.isValid()) {
                    this.log.error("Invalid orb of influence");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return [item];
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = AcquireUseOrbOfInfluence;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVVzZU9yYk9mSW5mbHVlbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVVc2VPcmJPZkluZmx1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFnQkgsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFBL0Q7O1lBRWlCLHVCQUFrQixHQUFHLElBQUksQ0FBQztRQTBDM0MsQ0FBQztRQXhDTyxhQUFhO1lBQ25CLE9BQU8sMEJBQTBCLENBQUM7UUFDbkMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHlDQUF5QyxDQUFDO1FBQ2xELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7WUFDdkQsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRTtnQkFDeEIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFMUUsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxnQkFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDdEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBRTVFO2lCQUFNO2dCQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUN0SDtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLDZCQUFtQixFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDM0MsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztpQkFDL0I7Z0JBRUQsT0FBTyxDQUFDLElBQUksQ0FBZ0QsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVwQixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUE1Q0QsMkNBNENDIn0=