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
                const description = doodad.description;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGREb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvQnVpbGREb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7OztJQXNCSCxNQUFhLGVBQWU7UUFPM0IsWUFBNkIsaUJBQStDO1lBQS9DLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFDNUUsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxRQUFvQztZQUM3RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBS2hELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdkYsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ3hCO1lBRUQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXpCLElBQUksTUFBTSxFQUFFO2dCQUNYLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ3ZDLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUNqRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7d0JBQ2pFLE1BQU0sY0FBYyxHQUFHLDRCQUFrQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDM0QsSUFBSSxjQUFjLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFOzRCQUN0RyxZQUFZLEdBQUcsSUFBSSxDQUFDO3lCQUNwQjtxQkFFRDt5QkFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUN0RCxZQUFZLEdBQUcsSUFBSSxDQUFDO3FCQUNwQjtpQkFDRDthQUNEO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLFlBQVksRUFBRTtvQkFFakIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFFdkM7cUJBQU07b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Q7aUJBQ0k7Z0JBQ0osTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUN4RyxJQUFJLGFBQWEsRUFBRTtvQkFDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztpQkFFOUM7cUJBQU07b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7aUJBQ2xFO2FBQ0Q7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO1FBR00sY0FBYyxDQUFDLENBQWdCLEVBQUUsTUFBYyxFQUFFLE9BQWU7WUFDdEUsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztLQUNEO0lBTE87UUFETixJQUFBLDJCQUFZLEVBQUMscUJBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO3lEQUs5QztJQTNFRiwwQ0E0RUMifQ==