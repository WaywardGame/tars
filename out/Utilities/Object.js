define(["require", "exports", "utilities/math/Vector2", "Enums"], function (require, exports, Vector2_1, Enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const creatureRadius = 3;
    let cachedObjects;
    function resetCachedObjects() {
        cachedObjects = {};
    }
    exports.resetCachedObjects = resetCachedObjects;
    function findObjects(id, allObjects, isTarget) {
        const cachedResults = cachedObjects[id];
        if (cachedResults) {
            return cachedResults;
        }
        const result = allObjects.filter(o => o !== undefined && o.z === localPlayer.z && isTarget(o)).sort((a, b) => Vector2_1.default.distance(localPlayer, a) > Vector2_1.default.distance(localPlayer, b) ? 1 : -1);
        cachedObjects[id] = result;
        return result;
    }
    exports.findObjects = findObjects;
    function findObject(id, object, isTarget) {
        const objects = findObjects(id, object, isTarget);
        return objects.length > 0 ? objects[0] : undefined;
    }
    exports.findObject = findObject;
    function findDoodad(id, isTarget) {
        return findObject(`Doodad:${id}`, game.doodads, isTarget);
    }
    exports.findDoodad = findDoodad;
    function findDoodads(id, isTarget) {
        return findObjects(`Doodad:${id}`, game.doodads, isTarget);
    }
    exports.findDoodads = findDoodads;
    function findCreature(id, isTarget) {
        return findObject(`Creature:${id}`, game.creatures, isTarget);
    }
    exports.findCreature = findCreature;
    function findCarvableCorpse(id, isTarget) {
        return findObject(`Corpse:${id}`, game.corpses, (corpse) => {
            if (isTarget(corpse) && corpse.type !== Enums_1.CreatureType.Blood && corpse.type !== Enums_1.CreatureType.WaterBlood) {
                const tile = game.getTileFromPoint(corpse);
                return tile.creature === undefined &&
                    tile.npc === undefined &&
                    !game.isPlayerAtPosition(corpse.x, corpse.y, corpse.z) &&
                    getNearbyCreature(corpse) === undefined;
            }
            return false;
        });
    }
    exports.findCarvableCorpse = findCarvableCorpse;
    function getNearbyCreature(point) {
        for (let x = -creatureRadius; x <= creatureRadius; x++) {
            for (let y = -creatureRadius; y <= creatureRadius; y++) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBRXpCLElBQUksYUFBbUQsQ0FBQztJQUV4RCxTQUFnQixrQkFBa0I7UUFDakMsYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRkQsZ0RBRUM7SUFFRCxTQUFnQixXQUFXLENBQXFCLEVBQVUsRUFBRSxVQUFlLEVBQUUsUUFBZ0M7UUFDNUcsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksYUFBYSxFQUFFO1lBQ2xCLE9BQU8sYUFBYSxDQUFDO1NBQ3JCO1FBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU1TCxhQUFhLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRTNCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVhELGtDQVdDO0lBRUQsU0FBZ0IsVUFBVSxDQUFxQixFQUFVLEVBQUUsTUFBVyxFQUFFLFFBQWdDO1FBQ3ZHLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLFFB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