var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/doodad/Doodads", "../../IObjective", "../../objectives/acquire/Item/AcquireItemForDoodad", "../../objectives/other/BuildItem", "../../utilities/Item", "../../objectives/core/MoveToTarget", "../../objectives/other/StartFire", "../../utilities/Doodad", "../../objectives/core/Lambda"], function (require, exports, EventBuses_1, EventManager_1, Doodads_1, IObjective_1, AcquireItemForDoodad_1, BuildItem_1, Item_1, MoveToTarget_1, StartFire_1, Doodad_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuildDoodadMode = void 0;
    class BuildDoodadMode {
        constructor(doodadTypeOrGroup) {
            this.doodadTypeOrGroup = doodadTypeOrGroup;
            this.doodadTypes = Doodad_1.getDoodadTypes(this.doodadTypeOrGroup);
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
                const inventoryItem = Item_1.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGREb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZS9tb2Rlcy9CdWlsZERvb2RhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBb0JBLE1BQWEsZUFBZTtRQVEzQixZQUE2QixpQkFBK0M7WUFBL0Msc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE4QjtZQUMzRSxJQUFJLENBQUMsV0FBVyxHQUFHLHVCQUFjLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9CO1lBQ3ZELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFLaEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNyRSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7YUFDeEI7WUFFRCxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7WUFFekIsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRTtvQkFDakQsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO3dCQUNsRCxNQUFNLGNBQWMsR0FBRyxpQkFBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSxjQUFjLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFOzRCQUN2RixZQUFZLEdBQUcsSUFBSSxDQUFDO3lCQUNwQjtxQkFFRDt5QkFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUN0RCxZQUFZLEdBQUcsSUFBSSxDQUFDO3FCQUNwQjtpQkFDRDthQUNEO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLFlBQVksRUFBRTtvQkFFakIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFFdkM7cUJBQU07b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNyQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ2hCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRDtpQkFDSTtnQkFDSixNQUFNLGFBQWEsR0FBRyxnQ0FBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ2pGLElBQUksYUFBYSxFQUFFO29CQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUU5QztxQkFBTTtvQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDbEU7YUFDRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFHTSxjQUFjLENBQUMsQ0FBZ0IsRUFBRSxNQUFjLEVBQUUsT0FBZTtZQUN0RSxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7YUFDeEI7UUFDRixDQUFDO0tBQ0Q7SUFMQTtRQURDLDJCQUFZLENBQUMscUJBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO3lEQUs5QztJQTVFRiwwQ0E2RUMifQ==