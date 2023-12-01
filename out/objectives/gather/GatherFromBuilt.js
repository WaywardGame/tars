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
define(["require", "exports", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/actions/PickUp", "@wayward/game/game/item/IItem", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../core/objective/Objective", "../core/ExecuteActionForItem", "../core/MoveToTarget", "../other/tile/ClearTile"], function (require, exports, IDoodad_1, PickUp_1, IItem_1, Dictionary_1, Translation_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1, ClearTile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromBuilt extends Objective_1.default {
        constructor(itemType, doodadtype) {
            super();
            this.itemType = itemType;
            this.doodadtype = doodadtype;
        }
        getIdentifier() {
            return `GatherFromBuilt:${IItem_1.ItemType[this.itemType]}:${IDoodad_1.DoodadType[this.doodadtype]}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from built doodad`;
        }
        async execute(context) {
            return context.utilities.object.findDoodads(context, this.getIdentifier(), doodad => {
                if (doodad.type !== this.doodadtype || context.utilities.base.isBaseDoodad(context, doodad)) {
                    return false;
                }
                if (context.options.goodCitizen && multiplayer.isConnected && doodad.getBuilder() !== context.human) {
                    return false;
                }
                return true;
            }, 5)
                .map(target => ([
                new MoveToTarget_1.default(target, true),
                new ClearTile_1.default(target.tile),
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    genericAction: {
                        action: PickUp_1.default,
                        args: [],
                    },
                }).passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.doodadtype).getString()} from ${target.getName()}`),
            ]));
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromBuilt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUJ1aWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21CdWlsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFjSCxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRWxELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXNCO1lBQ3BGLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUV4RixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZGLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUM7UUFDM0csQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDaEYsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO29CQUMxRixPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFFbEcsT0FBTyxLQUFLLENBQUM7Z0JBQ2pCLENBQUM7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNaLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUM5QixJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSw4QkFBb0IsQ0FDcEIsd0NBQWlCLENBQUMsT0FBTyxFQUN6QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDZjtvQkFDSSxhQUFhLEVBQUU7d0JBQ1gsTUFBTSxFQUFFLGdCQUFNO3dCQUNkLElBQUksRUFBRSxFQUFFO3FCQUNYO2lCQUNKLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO3FCQUN2QixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDakksQ0FBQyxDQUFDLENBQUM7UUFDWixDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE9BQWdCO1lBQ2pELE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUVKO0lBL0NELGtDQStDQyJ9