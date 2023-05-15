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
define(["require", "exports", "utilities/math/Vector2", "game/entity/IEntity"], function (require, exports, Vector2_1, IEntity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectUtilities = exports.FindObjectType = void 0;
    var FindObjectType;
    (function (FindObjectType) {
        FindObjectType[FindObjectType["Creature"] = 0] = "Creature";
        FindObjectType[FindObjectType["Doodad"] = 1] = "Doodad";
        FindObjectType[FindObjectType["Corpse"] = 2] = "Corpse";
        FindObjectType[FindObjectType["NPC"] = 3] = "NPC";
    })(FindObjectType = exports.FindObjectType || (exports.FindObjectType = {}));
    class ObjectUtilities {
        constructor() {
            this.cachedSorts = new Map();
            this.cachedObjects = new Map();
        }
        clearCache() {
            this.cachedSorts.clear();
            this.cachedObjects.clear();
        }
        getSortedObjects(context, type, allObjects, getPoint) {
            const sortedCacheId = FindObjectType[type];
            let sortedObjects = this.cachedSorts.get(sortedCacheId);
            if (sortedObjects === undefined) {
                sortedObjects = allObjects
                    .slice()
                    .filter(a => a !== undefined)
                    .sort((a, b) => Vector2_1.default.squaredDistance(context.human, getPoint?.(a) ?? a) - Vector2_1.default.squaredDistance(context.human, getPoint?.(b) ?? b));
                this.cachedSorts.set(sortedCacheId, sortedObjects);
            }
            return sortedObjects;
        }
        findObjects(context, type, id, allObjects, isTarget, top, getPoint) {
            const cacheId = top === undefined ? `${type}-${id}` : `${type}-${id}-${top}`;
            const cachedResults = this.cachedObjects.get(id) || this.cachedObjects.get(cacheId);
            if (cachedResults !== undefined) {
                return cachedResults;
            }
            const results = [];
            let matches = 0;
            const sortedObjects = this.getSortedObjects(context, type, allObjects);
            for (const object of sortedObjects) {
                if (isTarget(object)) {
                    results.push(object);
                    matches++;
                    if (top !== undefined && matches >= top) {
                        break;
                    }
                }
            }
            this.cachedObjects.set(cacheId, results);
            return results;
        }
        findDoodads(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Doodad, id, context.human.island.doodads.getObjects(), isTarget, top);
        }
        findCreatures(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Creature, id, context.human.island.creatures.getObjects(), isTarget, top);
        }
        findNPCS(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.NPC, id, context.human.island.npcs.getObjects(), isTarget, top);
        }
        findCarvableCorpses(context, id, isTarget) {
            return this.findObjects(context, FindObjectType.Corpse, id, context.human.island.corpses.getObjects(), corpse => {
                if (isTarget(corpse)) {
                    return context.utilities.tile.canButcherCorpse(context, corpse.tile, context.inventory.butcher);
                }
                return false;
            });
        }
        findHuntableCreatures(context, id, options) {
            return context.utilities.object.findCreatures(context, id, creature => {
                if (creature.isTamed()) {
                    return false;
                }
                if (options?.type !== undefined && creature.type !== options.type) {
                    return false;
                }
                if (options?.onlyHostile && !creature.hasAi(IEntity_1.AiType.Hostile)) {
                    return false;
                }
                if (options?.skipWaterCreatures && !(creature.getMoveType() & IEntity_1.MoveType.Land)) {
                    return false;
                }
                return true;
            }, options?.top);
        }
        findTamableCreatures(context, id, options) {
            return context.utilities.object.findCreatures(context, id, creature => {
                if (creature.isTamed()) {
                    return false;
                }
                if (options?.type !== undefined && creature.type !== options.type) {
                    return false;
                }
                if (options?.hostile !== undefined) {
                    return options.hostile === creature.hasAi(IEntity_1.AiType.Hostile);
                }
                return true;
            }, options?.top);
        }
    }
    exports.ObjectUtilities = ObjectUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWFILElBQVksY0FNWDtJQU5ELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7UUFDTixpREFBRyxDQUFBO0lBRUosQ0FBQyxFQU5XLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBTXpCO0lBRUQsTUFBYSxlQUFlO1FBQTVCO1lBRWtCLGdCQUFXLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDMUMsa0JBQWEsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWdIOUQsQ0FBQztRQTlHTyxVQUFVO1lBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0sZ0JBQWdCLENBQUksT0FBZ0IsRUFBRSxJQUFvQixFQUFFLFVBQXlCLEVBQUUsUUFBa0M7WUFDL0gsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hELElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDaEMsYUFBYSxHQUFHLFVBQVU7cUJBQ3hCLEtBQUssRUFBRTtxQkFDUCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDO3FCQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUUsQ0FBQyxJQUFJLENBQW9CLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUUsQ0FBQyxJQUFJLENBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNsTCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDbkQ7WUFFRCxPQUFPLGFBQWEsQ0FBQztRQUN0QixDQUFDO1FBRU8sV0FBVyxDQUFJLE9BQWdCLEVBQUUsSUFBb0IsRUFBRSxFQUFVLEVBQUUsVUFBeUIsRUFBRSxRQUFnQyxFQUFFLEdBQVksRUFBRSxRQUFrQztZQUN2TCxNQUFNLE9BQU8sR0FBRyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTdFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BGLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDaEMsT0FBTyxhQUFhLENBQUM7YUFDckI7WUFFRCxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7WUFDeEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBRWhCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXZFLEtBQUssTUFBTSxNQUFNLElBQUksYUFBYSxFQUFFO2dCQUVuQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDckIsT0FBTyxFQUFFLENBQUM7b0JBRVYsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLE9BQU8sSUFBSSxHQUFHLEVBQUU7d0JBQ3hDLE1BQU07cUJBQ047aUJBQ0Q7YUFDRDtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV6QyxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU0sV0FBVyxDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFFBQXFDLEVBQUUsR0FBWTtZQUNuRyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQWMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkksQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUFnQixFQUFFLEVBQVUsRUFBRSxRQUF5QyxFQUFFLEdBQVk7WUFDekcsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFnQixFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6SSxDQUFDO1FBRU0sUUFBUSxDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFFBQStCLEVBQUUsR0FBWTtZQUMxRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQVcsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUgsQ0FBQztRQUVNLG1CQUFtQixDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFFBQXFDO1lBQzdGLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBYyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUMzSCxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDckIsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNoRztnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLHFCQUFxQixDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLE9BQXlHO1lBQ25LLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0JBQ3JFLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUN2QixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxJQUFJLE9BQU8sRUFBRSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLElBQUksRUFBRTtvQkFDbEUsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxPQUFPLEVBQUUsV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUM1RCxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxJQUFJLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLGtCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzdFLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBRU0sb0JBQW9CLENBQUMsT0FBZ0IsRUFBRSxFQUFVLEVBQUUsT0FBd0U7WUFDakksT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRTtnQkFDckUsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3ZCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksT0FBTyxFQUFFLElBQUksS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxFQUFFO29CQUNsRSxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxJQUFJLE9BQU8sRUFBRSxPQUFPLEtBQUssU0FBUyxFQUFFO29CQUNuQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBbkhELDBDQW1IQyJ9