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
define(["require", "exports", "@wayward/game/game/doodad/DoodadManager", "@wayward/game/game/doodad/Doodads", "@wayward/game/game/doodad/IDoodad", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../../core/objective/Objective", "../../core/MoveToTarget", "../../other/doodad/StartFire", "../../other/item/BuildItem", "../item/AcquireItemForDoodad"], function (require, exports, DoodadManager_1, Doodads_1, IDoodad_1, Dictionary_1, Translation_1, Objective_1, MoveToTarget_1, StartFire_1, BuildItem_1, AcquireItemForDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBuildMoveToDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup, options = {}) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
            this.options = options;
        }
        getIdentifier() {
            return `AcquireBuildMoveToDoodad:${DoodadManager_1.default.isGroup(this.doodadTypeOrGroup) ? IDoodad_1.DoodadTypeGroup[this.doodadTypeOrGroup] : IDoodad_1.DoodadType[this.doodadTypeOrGroup]}`;
        }
        getStatus() {
            return `Acquiring ${DoodadManager_1.default.isGroup(this.doodadTypeOrGroup) ? Translation_1.default.nameOf(Dictionary_1.default.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation_1.default.nameOf(Dictionary_1.default.Doodad, this.doodadTypeOrGroup).getString()}`;
        }
        async execute(context) {
            const doodadTypes = context.utilities.doodad.getDoodadTypes(this.doodadTypeOrGroup);
            const doodads = !this.options.ignoreExistingDoodads ?
                context.utilities.object.findDoodads(context, this.getIdentifier(), (d) => doodadTypes.has(d.type) && context.utilities.base.isBaseDoodad(context, d)) :
                undefined;
            if (doodads !== undefined && doodads.length > 0) {
                return doodads.map(doodad => {
                    let requiresFire = false;
                    const description = doodad.description;
                    if (description && description.lit !== undefined) {
                        if (DoodadManager_1.default.isGroup(this.doodadTypeOrGroup)) {
                            const litDescription = Doodads_1.doodadDescriptions[description.lit];
                            if (litDescription && DoodadManager_1.default.isInGroup(description.lit, this.doodadTypeOrGroup)) {
                                requiresFire = true;
                            }
                        }
                        else if (description.lit === this.doodadTypeOrGroup) {
                            requiresFire = true;
                        }
                    }
                    const objectives = [];
                    if (requiresFire) {
                        objectives.push(new StartFire_1.default(doodad));
                    }
                    else if (!this.options.disableMoveTo) {
                        objectives.push(new MoveToTarget_1.default(doodad, true));
                    }
                    return objectives;
                });
            }
            const requiresFire = false;
            const objectives = [];
            const inventoryItem = context.utilities.item.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
            if (inventoryItem === undefined) {
                objectives.push(new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup));
            }
            objectives.push(new BuildItem_1.default(inventoryItem));
            if (requiresFire) {
                objectives.push(new StartFire_1.default());
            }
            return objectives;
        }
    }
    exports.default = AcquireBuildMoveToDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9kb29kYWQvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWdDSCxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUU5RCxZQUE2QixpQkFBK0MsRUFBbUIsVUFBcUQsRUFBRTtZQUNySixLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWdEO1FBRXRKLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLHVCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7UUFDbkssQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsdUJBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2xPLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNB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