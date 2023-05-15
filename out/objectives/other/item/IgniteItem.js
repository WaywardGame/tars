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
define(["require", "exports", "game/entity/action/IAction", "game/entity/IHuman", "game/entity/action/actions/Ignite", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/doodad/AcquireBuildMoveToFire", "./EquipItem", "./UseItem"], function (require, exports, IAction_1, IHuman_1, Ignite_1, IObjective_1, Objective_1, AcquireBuildMoveToFire_1, EquipItem_1, UseItem_1) {
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
            if (!item?.isValid()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWduaXRlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vSWduaXRlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFnQkgsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLElBQVc7WUFDcEMsS0FBSyxFQUFFLENBQUM7WUFEaUIsU0FBSSxHQUFKLElBQUksQ0FBTztRQUV4QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGNBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDdEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDckMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNuRixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDL0MsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE9BQU87Z0JBQ0gsSUFBSSxnQ0FBc0IsRUFBRTtnQkFDNUIsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDbkMsSUFBSSxpQkFBTyxDQUFDLGdCQUFNLEVBQUUsSUFBSSxDQUFDO2FBQzVCLENBQUM7UUFDTixDQUFDO0tBRUo7SUFsQ0QsNkJBa0NDIn0=