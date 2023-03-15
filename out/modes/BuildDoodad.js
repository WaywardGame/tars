var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/doodad/Doodads", "../core/objective/IObjective", "../objectives/acquire/item/AcquireItemForDoodad", "../objectives/other/item/BuildItem", "../objectives/core/MoveToTarget", "../objectives/other/doodad/StartFire", "../objectives/core/Lambda"], function (require, exports, EventBuses_1, EventManager_1, Doodads_1, IObjective_1, AcquireItemForDoodad_1, BuildItem_1, MoveToTarget_1, StartFire_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuildDoodadMode = void 0;
    class BuildDoodadMode {
        constructor(doodadTypeOrGroup) {
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        async initialize(context, finished) {
            this.finished = finished;
            this.doodadTypes = context.utilities.doodad.getDoodadTypes(this.doodadTypeOrGroup);
        }
        async determineObjectives(context) {
            const doodad = this.doodad ? context.human.island.doodads.get(this.doodad) : undefined;
            if (doodad && !doodad.isValid()) {
                this.doodad = undefined;
            }
            let requiresFire = false;
            if (doodad) {
                const description = doodad.description();
                if (description && description.lit !== undefined) {
                    if (context.human.island.doodads.isGroup(this.doodadTypeOrGroup)) {
                        const litDescription = Doodads_1.doodadDescriptions[description.lit];
                        if (litDescription && context.human.island.doodads.isInGroup(description.lit, this.doodadTypeOrGroup)) {
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
                        this.finished(true);
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
            }
            else {
                const inventoryItem = context.utilities.item.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
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
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.DoodadManager, "create")
    ], BuildDoodadMode.prototype, "onDoodadCreate", null);
    exports.BuildDoodadMode = BuildDoodadMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGREb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvQnVpbGREb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQW9CQSxNQUFhLGVBQWU7UUFPM0IsWUFBNkIsaUJBQStDO1lBQS9DLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFDNUUsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxRQUFvQztZQUM3RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBS2hELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdkYsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ3hCO1lBRUQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXpCLElBQUksTUFBTSxFQUFFO2dCQUNYLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ2pELElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTt3QkFDakUsTUFBTSxjQUFjLEdBQUcsNEJBQWtCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUMzRCxJQUFJLGNBQWMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7NEJBQ3RHLFlBQVksR0FBRyxJQUFJLENBQUM7eUJBQ3BCO3FCQUVEO3lCQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3RELFlBQVksR0FBRyxJQUFJLENBQUM7cUJBQ3BCO2lCQUNEO2FBQ0Q7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksTUFBTSxFQUFFO2dCQUNYLElBQUksWUFBWSxFQUFFO29CQUVqQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUV2QztxQkFBTTtvQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRDtpQkFDSTtnQkFDSixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3hHLElBQUksYUFBYSxFQUFFO29CQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUU5QztxQkFBTTtvQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDbEU7YUFDRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFHTSxjQUFjLENBQUMsQ0FBZ0IsRUFBRSxNQUFjLEVBQUUsT0FBZTtZQUN0RSxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7YUFDeEI7UUFDRixDQUFDO0tBQ0Q7SUFMTztRQUROLElBQUEsMkJBQVksRUFBQyxxQkFBUSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7eURBSzlDO0lBM0VGLDBDQTRFQyJ9