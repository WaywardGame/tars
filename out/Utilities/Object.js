define(["require", "exports", "entity/IEntity", "utilities/math/Vector2", "./Tile"], function (require, exports, IEntity_1, Vector2_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNearbyCreature = exports.findCarvableCorpses = exports.findCreatures = exports.findDoodads = exports.findDoodad = exports.findObject = exports.findObjects = exports.getSortedObjects = exports.resetCachedObjects = exports.FindObjectType = void 0;
    const creatureRadius = 5;
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
                .sort((a, b) => Vector2_1.default.squaredDistance(context.player, a) > Vector2_1.default.squaredDistance(context.player, b) ? 1 : -1);
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
        return findObject(context, FindObjectType.Doodad, id, island.doodads, isTarget);
    }
    exports.findDoodad = findDoodad;
    function findDoodads(context, id, isTarget, top) {
        return findObjects(context, FindObjectType.Doodad, id, island.doodads, isTarget, top);
    }
    exports.findDoodads = findDoodads;
    function findCreatures(context, id, isTarget, top) {
        return findObjects(context, FindObjectType.Creature, id, island.creatures, isTarget, top);
    }
    exports.findCreatures = findCreatures;
    function findCarvableCorpses(context, id, isTarget) {
        return findObjects(context, FindObjectType.Corpse, id, island.corpses, corpse => {
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
                const validPoint = game.ensureValidPoint({ x: point.x + x, y: point.y + y, z: point.z });
                if (validPoint) {
                    const tile = game.getTileFromPoint(validPoint);
                    if (tile.creature && !tile.creature.isTamed()) {
                        if (tile.creature.getMoveType() === IEntity_1.MoveType.None && (Math.abs(point.x - x) > 1 || Math.abs(point.y - y) > 1)) {
                            continue;
                        }
                        return tile.creature;
                    }
                }
            }
        }
        return undefined;
    }
    exports.getNearbyCreature = getNearbyCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdBLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztJQUV6QixNQUFNLFdBQVcsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNoRCxNQUFNLGFBQWEsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVsRCxJQUFZLGNBSVg7SUFKRCxXQUFZLGNBQWM7UUFDekIsMkRBQVEsQ0FBQTtRQUNSLHVEQUFNLENBQUE7UUFDTix1REFBTSxDQUFBO0lBQ1AsQ0FBQyxFQUpXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBSXpCO0lBRUQsU0FBZ0Isa0JBQWtCO1FBQ2pDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUhELGdEQUdDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQXFCLE9BQWdCLEVBQUUsSUFBb0IsRUFBRSxVQUFlO1FBQzNHLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ25ELElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtZQUNoQyxhQUFhLEdBQUcsVUFBVTtpQkFDeEIsS0FBSyxFQUFFO2lCQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lB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