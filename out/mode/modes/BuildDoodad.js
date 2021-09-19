var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/doodad/Doodads", "../../IObjective", "../../objectives/acquire/item/AcquireItemForDoodad", "../../objectives/other/item/BuildItem", "../../objectives/core/MoveToTarget", "../../objectives/other/doodad/StartFire", "../../objectives/core/Lambda", "../../utilities/Doodad", "../../utilities/Item"], function (require, exports, EventBuses_1, EventManager_1, Doodads_1, IObjective_1, AcquireItemForDoodad_1, BuildItem_1, MoveToTarget_1, StartFire_1, Lambda_1, Doodad_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuildDoodadMode = void 0;
    class BuildDoodadMode {
        constructor(doodadTypeOrGroup) {
            this.doodadTypeOrGroup = doodadTypeOrGroup;
            this.doodadTypes = Doodad_1.doodadUtilities.getDoodadTypes(this.doodadTypeOrGroup);
        }
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const doodad = this.doodad ? island.doodads[this.doodad] : undefined;
            if (doodad && !doodad.isValid()) {
                this.doodad = undefined;
            }
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
            if (doodad) {
                if (requiresFire) {
                    objectives.push(new StartFire_1.default(doodad));
                }
                else {
                    objectives.push(new MoveToTarget_1.default(doodad, true));
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished();
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
            }
            else {
                const inventoryItem = Item_1.itemUtilities.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
                if (inventoryItem) {
                    objectives.push(new BuildItem_1.default(inventoryItem));
                }
                else {
                    objectives.push(new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup));
                }
            }
            return objectives;
        }
        onDoodadCreate(_, doodad, creator) {
            if (creator === localPlayer && this.doodadTypes.has(doodad.type)) {
                this.doodad = doodad.id;
            }
        }
    }
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.DoodadManager, "create")
    ], BuildDoodadMode.prototype, "onDoodadCreate", null);
    exports.BuildDoodadMode = BuildDoodadMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGREb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZS9tb2Rlcy9CdWlsZERvb2RhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBb0JBLE1BQWEsZUFBZTtRQVEzQixZQUE2QixpQkFBK0M7WUFBL0Msc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE4QjtZQUMzRSxJQUFJLENBQUMsV0FBVyxHQUFHLHdCQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQjtZQUN2RCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBS2hELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDckUsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ3hCO1lBRUQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXpCLElBQUksTUFBTSxFQUFFO2dCQUNYLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ2pELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTt3QkFDbEQsTUFBTSxjQUFjLEdBQUcsaUJBQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2hELElBQUksY0FBYyxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTs0QkFDdkYsWUFBWSxHQUFHLElBQUksQ0FBQzt5QkFDcEI7cUJBRUQ7eUJBQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDdEQsWUFBWSxHQUFHLElBQUksQ0FBQztxQkFDcEI7aUJBQ0Q7YUFDRDtZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsSUFBSSxZQUFZLEVBQUU7b0JBRWpCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBRXZDO3FCQUFNO29CQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDckMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Q7aUJBQ0k7Z0JBQ0osTUFBTSxhQUFhLEdBQUcsb0JBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQy9GLElBQUksYUFBYSxFQUFFO29CQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUU5QztxQkFBTTtvQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDbEU7YUFDRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFHTSxjQUFjLENBQUMsQ0FBZ0IsRUFBRSxNQUFjLEVBQUUsT0FBZTtZQUN0RSxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7YUFDeEI7UUFDRixDQUFDO0tBQ0Q7SUFMQTtRQURDLDJCQUFZLENBQUMscUJBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO3lEQUs5QztJQTVFRiwwQ0E2RUMifQ==