define(["require", "exports", "utilities/math/Vector2", "./Tile"], function (require, exports, Vector2_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.objectUtilities = exports.FindObjectType = void 0;
    const creatureRadius = 5;
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
        getNearbyCreatures(point) {
            const creatures = [];
            for (let x = creatureRadius * -1; x <= creatureRadius; x++) {
                for (let y = creatureRadius * -1; y <= creatureRadius; y++) {
                    const validPoint = game.ensureValidPoint({ x: point.x + x, y: point.y + y, z: point.z });
                    if (validPoint) {
                        const tile = game.getTileFromPoint(validPoint);
                        if (tile.creature && !tile.creature.isTamed()) {
                            creatures.push(tile.creature);
                        }
                    }
                }
            }
            return creatures;
        }
    }
    exports.objectUtilities = new ObjectUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVVBLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztJQUV6QixJQUFZLGNBS1g7SUFMRCxXQUFZLGNBQWM7UUFDekIsMkRBQVEsQ0FBQTtRQUNSLHVEQUFNLENBQUE7UUFDTix1REFBTSxDQUFBO1FBQ04sbURBQUksQ0FBQTtJQUNMLENBQUMsRUFMVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUt6QjtJQUVELE1BQU0sZUFBZTtRQUFyQjtZQUVTLGdCQUFXLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDMUMsa0JBQWEsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTZHckQsQ0FBQztRQTNHTyxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxnQkFBZ0IsQ0FBSSxPQUFnQixFQUFFLElBQW9CLEVBQUUsVUFBeUIsRUFBRSxRQUFrQztZQUMvSCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDeEQsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxhQUFhLEdBQUcsVUFBVTtxQkFDeEIsS0FBSyxFQUFFO3FCQUNQLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUM7cUJBQzVCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxlQUFDLE9BQUEsaUJBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFB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