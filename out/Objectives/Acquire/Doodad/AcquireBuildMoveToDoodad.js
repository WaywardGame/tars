define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "language/Dictionaries", "language/Translation", "../../../Objective", "../../core/MoveToTarget", "../../other/item/BuildItem", "../../other/doodad/StartFire", "../Item/AcquireItemForDoodad", "../../../utilities/Doodad", "../../../utilities/Object", "../../../utilities/Item", "../../../utilities/Base"], function (require, exports, Doodads_1, IDoodad_1, Dictionaries_1, Translation_1, Objective_1, MoveToTarget_1, BuildItem_1, StartFire_1, AcquireItemForDoodad_1, Doodad_1, Object_1, Item_1, Base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBuildMoveToDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        getIdentifier() {
            return `AcquireBuildMoveToDoodad:${doodadManager.isGroup(this.doodadTypeOrGroup) ? IDoodad_1.DoodadTypeGroup[this.doodadTypeOrGroup] : IDoodad_1.DoodadType[this.doodadTypeOrGroup]}`;
        }
        getStatus() {
            return `Acquiring ${doodadManager.isGroup(this.doodadTypeOrGroup) ? Translation_1.default.nameOf(Dictionaries_1.Dictionary.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation_1.default.nameOf(Dictionaries_1.Dictionary.Doodad, this.doodadTypeOrGroup).getString()}`;
        }
        async execute(context) {
            const doodadTypes = Doodad_1.doodadUtilities.getDoodadTypes(this.doodadTypeOrGroup);
            const doodad = Object_1.objectUtilities.findDoodad(context, this.getIdentifier(), (d) => doodadTypes.has(d.type) && Base_1.baseUtilities.isBaseDoodad(context, d));
            let requiresFire = false;
            if (doodad) {
                const description = doodad.description();
                if (description && description.lit !== undefined) {
                    if (doodadManager.isGroup(this.doodadTypeOrGroup)) {
                        const litDescription = Doodads_1.default[description.lit];
                        if (litDescription && doodadManager.isInGroup(description.lit, this.doodadTypeOrGroup)) {
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
                const inventoryItem = Item_1.itemUtilities.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
                if (inventoryItem === undefined) {
                    objectives.push(new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup));
                }
                objectives.push(new BuildItem_1.default(inventoryItem));
            }
            if (requiresFire) {
                objectives.push(new StartFire_1.default(doodad));
            }
            else if (doodad) {
                objectives.push(new MoveToTarget_1.default(doodad, true));
            }
            return objectives;
        }
    }
    exports.default = AcquireBuildMoveToDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9kb29kYWQvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQTZCQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUU5RCxZQUE2QixpQkFBK0M7WUFDM0UsS0FBSyxFQUFFLENBQUM7WUFEb0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE4QjtRQUU1RSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDRCQUE0QixhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7UUFDbkssQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDbE8sQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxXQUFXLEdBQUcsd0JBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFM0UsTUFBTSxNQUFNLEdBQUcsd0JBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0osSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXpCLElBQUksTUFBTSxFQUFFO2dCQUNYLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ2pELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTt3QkFDbEQsTUFBTSxjQUFjLEdBQUcsaUJBQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2hELElBQUksY0FBYyxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTs0QkFDdkYsWUFBWSxHQUFHLElBQUksQ0FBQzt5QkFDcEI7cUJBRUQ7eUJBQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDdEQsWUFBWSxHQUFHLElBQUksQ0FBQztxQkFDcEI7aUJBQ0Q7YUFDRDtZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLGFBQWEsR0FBRyxvQkFBYSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDL0YsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUNoQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDbEU7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUM5QztZQUVELElBQUksWUFBWSxFQUFFO2dCQUVqQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBRXZDO2lCQUFNLElBQUksTUFBTSxFQUFFO2dCQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNoRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQTFERCwyQ0EwREMifQ==