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
    })(FindObjectType || (exports.FindObjectType = FindObjectType = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWFILElBQVksY0FNWDtJQU5ELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7UUFDTixpREFBRyxDQUFBO0lBRUosQ0FBQyxFQU5XLGNBQWMsOEJBQWQsY0FBYyxRQU16QjtJQUVELE1BQWEsZUFBZTtRQUE1QjtZQUVrQixnQkFBVyxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzFDLGtCQUFhLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFnSDlELENBQUM7UUE5R08sVUFBVTtZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVNLGdCQUFnQixDQUFJLE9BQWdCLEVBQUUsSUFBb0IsRUFBRSxVQUF5QixFQUFFLFFBQWtDO1lBQy9ILE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4RCxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQ2hDLGFBQWEsR0FBRyxVQUFVO3FCQUN4QixLQUFLLEVBQUU7cUJBQ1AsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztxQkFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFFLENBQUMsSUFBSSxD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