define(["require", "exports", "utilities/math/Vector2", "./Tile"], function (require, exports, Vector2_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.objectUtilities = exports.FindObjectType = void 0;
    var FindObjectType;
    (function (FindObjectType) {
        FindObjectType[FindObjectType["Creature"] = 0] = "Creature";
        FindObjectType[FindObjectType["Doodad"] = 1] = "Doodad";
        FindObjectType[FindObjectType["Corpse"] = 2] = "Corpse";
        FindObjectType[FindObjectType["Item"] = 3] = "Item";
    })(FindObjectType = exports.FindObjectType || (exports.FindObjectType = {}));
    class ObjectUtilities {
        constructor() {
            this.cachedSorts = new Map();
            this.cachedObjects = new Map();
        }
        reset() {
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
            return this.findObject(context, FindObjectType.Doodad, id, island.doodads, isTarget);
        }
        findDoodads(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Doodad, id, island.doodads, isTarget, top);
        }
        findCreatures(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Creature, id, island.creatures, isTarget, top);
        }
        findItem(context, id, isTarget, top) {
            return this.findObjects(context, FindObjectType.Item, id, island.items, isTarget, top, (object) => object.getPoint());
        }
        findCarvableCorpses(context, id, isTarget) {
            return this.findObjects(context, FindObjectType.Corpse, id, island.corpses, corpse => {
                if (isTarget(corpse)) {
                    const tile = game.getTileFromPoint(corpse);
                    return tile.creature === undefined &&
                        tile.npc === undefined &&
                        tile.events === undefined &&
                        Tile_1.tileUtilities.isFreeOfOtherPlayers(context, corpse);
                }
                return false;
            });
        }
    }
    exports.objectUtilities = new ObjectUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVVBLElBQVksY0FLWDtJQUxELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7UUFDTixtREFBSSxDQUFBO0lBQ0wsQ0FBQyxFQUxXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBS3pCO0lBRUQsTUFBTSxlQUFlO1FBQXJCO1lBRVMsZ0JBQVcsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxQyxrQkFBYSxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBcUZyRCxDQUFDO1FBbkZPLEtBQUs7WUFDWCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVNLGdCQUFnQixDQUFJLE9BQWdCLEVBQUUsSUFBb0IsRUFBRSxVQUF5QixFQUFFLFFBQWtDO1lBQy9ILE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4RCxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQ2hDLGFBQWEsR0FBRyxVQUFVO3FCQUN4QixLQUFLLEVBQUU7cUJBQ1AsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztxQkFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLGVBQUMsT0FBQSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQUEsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFH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