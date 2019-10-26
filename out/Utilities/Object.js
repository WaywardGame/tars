define(["require", "exports", "utilities/math/Vector2", "./Tile"], function (require, exports, Vector2_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const creatureRadius = 3;
    const cachedSorts = new Map();
    const cachedObjects = new Map();
    var FindObjectType;
    (function (FindObjectType) {
        FindObjectType[FindObjectType["Creature"] = 0] = "Creature";
        FindObjectType[FindObjectType["Doodad"] = 1] = "Doodad";
        FindObjectType[FindObjectType["Corpse"] = 2] = "Corpse";
    })(FindObjectType = exports.FindObjectType || (exports.FindObjectType = {}));
    function resetCachedObjects() {
        cachedSorts.clear();
        cachedObjects.clear();
    }
    exports.resetCachedObjects = resetCachedObjects;
    function getSortedObjects(context, type, allObjects) {
        const sortedCacheId = FindObjectType[type];
        let sortedObjects = cachedSorts.get(sortedCacheId);
        if (sortedObjects === undefined) {
            sortedObjects = allObjects
                .slice()
                .sort((a, b) => Vector2_1.default.distance(context.player, a) > Vector2_1.default.distance(context.player, b) ? 1 : -1);
            cachedSorts.set(sortedCacheId, sortedObjects);
        }
        return sortedObjects;
    }
    exports.getSortedObjects = getSortedObjects;
    function findObjects(context, type, id, allObjects, isTarget, top) {
        const cacheId = top === undefined ? `${type}-${id}` : `${type}-${id}-${top}`;
        const cachedResults = cachedObjects.get(id) || cachedObjects.get(cacheId);
        if (cachedResults !== undefined) {
            return cachedResults;
        }
        const results = [];
        let matches = 0;
        const sortedObjects = getSortedObjects(context, type, allObjects);
        for (const object of sortedObjects) {
            if (object !== undefined && object.z === context.player.z && isTarget(object)) {
                results.push(object);
                matches++;
                if (top !== undefined && matches >= top) {
                    break;
                }
            }
        }
        cachedObjects.set(cacheId, results);
        return results;
    }
    exports.findObjects = findObjects;
    function findObject(context, type, id, object, isTarget) {
        const objects = findObjects(context, type, id, object, isTarget, 1);
        return objects.length > 0 ? objects[0] : undefined;
    }
    exports.findObject = findObject;
    function findDoodad(context, id, isTarget) {
        return findObject(context, FindObjectType.Doodad, id, game.doodads, isTarget);
    }
    exports.findDoodad = findDoodad;
    function findDoodads(context, id, isTarget, top) {
        return findObjects(context, FindObjectType.Doodad, id, game.doodads, isTarget, top);
    }
    exports.findDoodads = findDoodads;
    function findCreatures(context, id, isTarget, top) {
        return findObjects(context, FindObjectType.Creature, id, game.creatures, isTarget, top);
    }
    exports.findCreatures = findCreatures;
    function findCarvableCorpses(context, id, isTarget) {
        return findObjects(context, FindObjectType.Corpse, id, game.corpses, corpse => {
            if (isTarget(corpse)) {
                const tile = game.getTileFromPoint(corpse);
                return tile.creature === undefined &&
                    tile.npc === undefined &&
                    tile.events === undefined &&
                    Tile_1.isFreeOfOtherPlayers(context, corpse);
            }
            return false;
        });
    }
    exports.findCarvableCorpses = findCarvableCorpses;
    function getNearbyCreature(point) {
        for (let x = creatureRadius * -1; x <= creatureRadius; x++) {
            for (let y = creatureRadius * -1; y <= creatureRadius; y++) {
                const tile = game.getTile(point.x + x, point.y + y, point.z);
                if (tile.creature && !tile.creature.isTamed()) {
                    return tile.creature;
                }
            }
        }
        return undefined;
    }
    exports.getNearbyCreature = getNearbyCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBRXpCLE1BQU0sV0FBVyxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2hELE1BQU0sYUFBYSxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRWxELElBQVksY0FJWDtJQUpELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7SUFDUCxDQUFDLEVBSlcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFJekI7SUFFRCxTQUFnQixrQkFBa0I7UUFDakMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBSEQsZ0RBR0M7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBcUIsT0FBZ0IsRUFBRSxJQUFvQixFQUFFLFVBQWU7UUFDM0csTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksYUFBYSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkQsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO1lBQ2hDLGFBQWEsR0FBRyxVQUFVO2lCQUN4QixLQUFLLEVBQUU7aUJBQ1AsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFD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