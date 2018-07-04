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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvT2JqZWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFNQSxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFekIsSUFBSSxhQUFtRCxDQUFDO0lBRXhEO1FBQ0MsYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRkQsZ0RBRUM7SUFFRCxxQkFBZ0QsRUFBVSxFQUFFLFVBQWUsRUFBRSxRQUFnQztRQUM1RyxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxhQUFhLEVBQUU7WUFDbEIsT0FBTyxhQUFhLENBQUM7U0FDckI7UUFFRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFNLGFBQWEsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7UUFFM0IsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBWEQsa0NBV0M7SUFFRCxvQkFBK0MsRUFBVSxFQUFFLE1BQVcsRUFBRSxRQUFnQztRQUN2RyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNsRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUNwRCxDQUFDO0lBSEQsZ0NBR0M7SUFFRCxvQkFBMkIsRUFBVSxFQUFFLFFBQXNDO1FBQzVFLE9BQU8sVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUZELGdDQUVDO0lBRUQscUJBQTRCLEVBQVUsRUFBRSxRQUFzQztRQUM3RSxPQUFPLFdBQVcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFGRCxrQ0FFQztJQUVELHNCQUE2QixFQUFVLEVBQUUsUUFBMEM7UUFDbEYsT0FBTyxVQUFVLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBd0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRkQsb0NBRUM7SUFFRCxvQkFBMkIsRUFBVSxFQUFFLFFBQXNDO1FBQzVFLE9BQU8sVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUZELGdDQUVDO0lBRUQsMkJBQWtDLEtBQWU7UUFDaEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzlDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFDckI7YUFDRDtTQUNEO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQVhELDhDQVdDIn0=