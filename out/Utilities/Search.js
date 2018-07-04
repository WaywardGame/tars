define(["require", "exports", "utilities/math/Vector2"], function (require, exports, Vector2_1) {
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
        const result = allObjects.filter(o => o !== undefined && o.z === localPlayer.z && isTarget(o)).sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
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
    function findCorpse(id, isTarget) {
        return findObject(`Corpse:${id}`, game.corpses, isTarget);
    }
    exports.findCorpse = findCorpse;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9TZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBTUEsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBRXpCLElBQUksYUFBbUQsQ0FBQztJQUV4RDtRQUNDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUZELGdEQUVDO0lBRUQscUJBQWdELEVBQVUsRUFBRSxVQUFlLEVBQUUsUUFBZ0M7UUFDNUcsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksYUFBYSxFQUFFO1lBQ2xCLE9BQU8sYUFBYSxDQUFDO1NBQ3JCO1FBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxTSxhQUFhLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRTNCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVhELGtDQVdDO0lBRUQsb0JBQStDLEVBQVUsRUFBRSxNQUFXLEVBQUUsUUFBZ0M7UUFDdkcsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDcEQsQ0FBQztJQUhELGdDQUdDO0lBRUQsb0JBQTJCLEVBQVUsRUFBRSxRQUFzQztRQUM1RSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFGRCxnQ0FFQztJQUVELHFCQUE0QixFQUFVLEVBQUUsUUFBc0M7UUFDN0UsT0FBTyxXQUFXLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRkQsa0NBRUM7SUFFRCxzQkFBNkIsRUFBVSxFQUFFLFFBQTBDO1FBQ2xGLE9BQU8sVUFBVSxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQXdCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUZELG9DQUVDO0lBRUQsb0JBQTJCLEVBQVUsRUFBRSxRQUFzQztRQUM1RSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFGRCxnQ0FFQztJQUVELDJCQUFrQyxLQUFlO1FBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3ZELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUM5QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCO2FBQ0Q7U0FDRDtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFYRCw4Q0FXQyJ9