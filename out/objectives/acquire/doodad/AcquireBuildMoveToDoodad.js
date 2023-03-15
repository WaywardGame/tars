define(["require", "exports", "game/doodad/DoodadManager", "game/doodad/Doodads", "game/doodad/IDoodad", "language/Dictionary", "language/Translation", "../../../core/objective/Objective", "../../core/MoveToTarget", "../../other/doodad/StartFire", "../../other/item/BuildItem", "../item/AcquireItemForDoodad"], function (require, exports, DoodadManager_1, Doodads_1, IDoodad_1, Dictionary_1, Translation_1, Objective_1, MoveToTarget_1, StartFire_1, BuildItem_1, AcquireItemForDoodad_1) {
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
                    const description = doodad.description();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9kb29kYWQvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQThCQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUU5RCxZQUE2QixpQkFBK0MsRUFBbUIsVUFBcUQsRUFBRTtZQUNySixLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWdEO1FBRXRKLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLHVCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7UUFDbkssQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsdUJBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2xPLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMs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