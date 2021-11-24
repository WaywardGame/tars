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
                        Tile_1.tileUtilities.isFreeOfOtherPlayers(context, corpse);
                }
                return false;
            });
        }
    }
    exports.objectUtilities = new ObjectUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVVBLElBQVksY0FLWDtJQUxELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7UUFDTixtREFBSSxDQUFBO0lBQ0wsQ0FBQyxFQUxXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBS3pCO0lBRUQsTUFBTSxlQUFlO1FBQXJCO1lBRVMsZ0JBQVcsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxQyxrQkFBYSxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBc0ZyRCxDQUFDO1FBcEZPLFVBQVU7WUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxnQkFBZ0IsQ0FBSSxPQUFnQixFQUFFLElBQW9CLEVBQUUsVUFBeUIsRUFBRSxRQUFrQztZQUMvSCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDeEQsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxhQUFhLEdBQUcsVUFBVTtxQkFDeEIsS0FBSyxFQUFFO3FCQUNQLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUM7cUJBQzVCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxlQUFDLE9BQUEsaUJBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFBLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FB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