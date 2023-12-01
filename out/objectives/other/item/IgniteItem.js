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
define(["require", "exports", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/IHuman", "@wayward/game/game/entity/action/actions/Ignite", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/doodad/AcquireBuildMoveToFire", "./EquipItem", "./UseItem"], function (require, exports, IAction_1, IHuman_1, Ignite_1, IObjective_1, Objective_1, AcquireBuildMoveToFire_1, EquipItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class IgniteItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `IgniteItem:${this.item}`;
        }
        getStatus() {
            return `Igniting ${this.item?.getName()}`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid) {
                this.log.error("Invalid ignite item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description;
            if (!description || !description.lit || !description.use?.includes(IAction_1.ActionType.Ignite)) {
                this.log.error(`Invalid ignite item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new AcquireBuildMoveToFire_1.default(),
                new EquipItem_1.default(IHuman_1.EquipType.Held, item),
                new UseItem_1.default(Ignite_1.default, item),
            ];
        }
    }
    exports.default = IgniteItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWduaXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vSWduaXRlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFnQkgsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBRWhELFlBQTZCLElBQVc7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTztRQUV4QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGNBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDdEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLG9CQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDdkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQy9DLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7WUFDbkMsQ0FBQztZQUVELE9BQU87Z0JBQ04sSUFBSSxnQ0FBc0IsRUFBRTtnQkFDNUIsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDbkMsSUFBSSxpQkFBTyxDQUFDLGdCQUFNLEVBQUUsSUFBSSxDQUFDO2FBQ3pCLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUFsQ0QsNkJBa0NDIn0=