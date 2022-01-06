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
            const doodad = !this.options.ignoreExistingDoodads ?
                context.utilities.object.findDoodad(context, this.getIdentifier(), (d) => doodadTypes.has(d.type) && context.utilities.base.isBaseDoodad(context, d)) :
                undefined;
            let requiresFire = false;
            if (doodad) {
                const description = doodad.description();
                if (description && description.lit !== undefined) {
                    if (DoodadManager_1.default.isGroup(this.doodadTypeOrGroup)) {
                        const litDescription = Doodads_1.default[description.lit];
                        if (litDescription && DoodadManager_1.default.isInGroup(description.lit, this.doodadTypeOrGroup)) {
                            requiresFire = true;
                        }
                    }
                    else if (description.lit === this.doodadTypeOrGroup) {
                        requiresFire = true;
                    }
                }
            }
            const objectives = [];
            if (!doodad) {
                const inventoryItem = context.utilities.item.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
                if (inventoryItem === undefined) {
                    objectives.push(new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup));
                }
                objectives.push(new BuildItem_1.default(inventoryItem));
            }
            if (requiresFire) {
                objectives.push(new StartFire_1.default(doodad));
            }
            else if (doodad && !this.options.disableMoveTo) {
                objectives.push(new MoveToTarget_1.default(doodad, true));
            }
            return objectives;
        }
    }
    exports.default = AcquireBuildMoveToDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9kb29kYWQvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQThCQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUU5RCxZQUE2QixpQkFBK0MsRUFBbUIsVUFBcUQsRUFBRTtZQUNySixLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWdEO1FBRXRKLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLHVCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7UUFDbkssQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsdUJBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2xPLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUVwRixNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDbkQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvSixTQUFTLENBQUM7WUFFWCxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7WUFFekIsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRTtvQkFDakQsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTt3QkFDbEQsTUFBTSxjQUFjLEdBQUcsaUJBQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2hELElBQUksY0FBYyxJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7NEJBQ3ZGLFlBQVksR0FBRyxJQUFJLENBQUM7eUJBQ3BCO3FCQUVEO3lCQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3RELFlBQVksR0FBRyxJQUFJLENBQUM7cUJBQ3BCO2lCQUNEO2FBQ0Q7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUN4RyxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2lCQUNsRTtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxZQUFZLEVBQUU7Z0JBRWpCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFFdkM7aUJBQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtnQkFDakQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDaEQ7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUE1REQsMkNBNERDIn0=