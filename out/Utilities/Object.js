define(["require", "exports", "utilities/math/Vector2", "game/entity/IEntity"], function (require, exports, Vector2_1, IEntity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectUtilities = exports.FindObjectType = void 0;
    var FindObjectType;
    (function (FindObjectType) {
        FindObjectType[FindObjectType["Creature"] = 0] = "Creature";
        FindObjectType[FindObjectType["Doodad"] = 1] = "Doodad";
        FindObjectType[FindObjectType["Corpse"] = 2] = "Corpse";
        FindObjectType[FindObjectType["Item"] = 3] = "Item";
        FindObjectType[FindObjectType["NPC"] = 4] = "NPC";
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
                    .sort((a, b) => { var _a, _b; return Vector2_1.default.squaredDistance(context.player, (_a = getPoint === null || getPoint === void 0 ? void 0 : getPoint(a)) !== null && _a !== void 0 ? _a : a) - Vector2_1.default.squaredDistance(context.player, (_b = getPoint === null || getPoint === void 0 ? void 0 : getPoint(b)) !== null && _b !== void 0 ? _b : b); });
                this.cachedSorts.set(sortedCacheId, sortedObjects);
            }
            return sortedObjects;
        }
        findObjects(context, type, id, allObjects, isTarget, top, getPoint) {
            var _a;
            const cacheId = top === undefined ? `${type}-${id}` : `${type}-${id}-${top}`;
            const cachedResults = this.cachedObjects.get(id) || this.cachedObjects.get(cacheId);
            if (cachedResults !== undefined) {
                return cachedResults;
            }
            const results = [];
            let matches = 0;
            const sortedObjects = this.getSortedObjects(context, type, allObjects);
            for (const object of sortedObjects) {
                if (((_a = getPoint === null || getPoint === void 0 ? void 0 : getPoint(object)) !== null && _a !== void 0 ? _a : object).z === context.player.z && isTarget(object)) {
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
        findObject(context, type, id, object, isTarget) {
            const objects = this.findObjects(context, type, id, object, isTarget, 1);
            return objects.length > 0 ? objects[0] : undefined;
        }
        findDoodad(context, id, isTarget) {
            return this.findObject(context, FindObjectType.Doodad, id, context.player.island.doodads.getObjects(), isTarget);
        }
        findDoodads(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Doodad, id, context.player.island.doodads.getObjects(), isTarget, top);
        }
        findCreatures(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Creature, id, context.player.island.creatures.getObjects(), isTarget, top);
        }
        findNPCS(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.NPC, id, context.player.island.npcs.getObjects(), isTarget, top);
        }
        findItem(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Item, id, context.player.island.items.getObjects(), isTarget, top, (object) => object.getPoint());
        }
        findCarvableCorpses(context, id, isTarget) {
            const island = context.player.island;
            return this.findObjects(context, FindObjectType.Corpse, id, island.corpses.getObjects(), corpse => {
                if (isTarget(corpse)) {
                    const tile = island.getTileFromPoint(corpse);
                    return tile.creature === undefined &&
                        tile.npc === undefined &&
                        tile.events === undefined &&
                        context.utilities.tile.isFreeOfOtherPlayers(context, corpse);
                }
                return false;
            });
        }
        findHuntableCreatures(context, id, onlyHostile, top) {
            return context.utilities.object.findCreatures(context, id, creature => !creature.isTamed() && (!onlyHostile || creature.hasAi(IEntity_1.AiType.Hostile)), top);
        }
        findTamableCreatures(context, id, onlyHostile, top) {
            return context.utilities.object.findCreatures(context, id, creature => {
                if (creature.isTamed()) {
                    return false;
                }
                if (creature.hasAi(IEntity_1.AiType.Hostile)) {
                    return onlyHostile;
                }
                return !onlyHostile;
            }, top);
        }
    }
    exports.ObjectUtilities = ObjectUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdBLElBQVksY0FNWDtJQU5ELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7UUFDTixtREFBSSxDQUFBO1FBQ0osaURBQUcsQ0FBQTtJQUNKLENBQUMsRUFOVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQU16QjtJQUVELE1BQWEsZUFBZTtRQUE1QjtZQUVrQixnQkFBVyxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzFDLGtCQUFhLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUEyRzlELENBQUM7UUF6R08sVUFBVTtZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVNLGdCQUFnQixDQUFJLE9BQWdCLEVBQUUsSUFBb0IsRUFBRSxVQUF5QixFQUFFLFFBQWtDO1lBQy9ILE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4RCxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQ2hDLGFBQWEsR0FBRyxVQUFVO3FCQUN4QixLQUFLLEVBQUU7cUJBQ1AsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztxQkFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLGVBQUMsT0FBQSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQUEsUUFBUSxhQUFSLFFB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