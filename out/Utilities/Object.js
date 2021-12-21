define(["require", "exports", "utilities/math/Vector2", "game/entity/IEntity", "./Tile"], function (require, exports, Vector2_1, IEntity_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.objectUtilities = exports.FindObjectType = void 0;
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
                        Tile_1.tileUtilities.isFreeOfOtherPlayers(context, corpse);
                }
                return false;
            });
        }
        findHuntableCreatures(context, id, onlyHostile, top) {
            return exports.objectUtilities.findCreatures(context, id, creature => !creature.isTamed() && (!onlyHostile || creature.hasAi(IEntity_1.AiType.Hostile)), top);
        }
        findTamableCreatures(context, id, onlyHostile, top) {
            return exports.objectUtilities.findCreatures(context, id, creature => {
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
    exports.objectUtilities = new ObjectUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVlBLElBQVksY0FNWDtJQU5ELFdBQVksY0FBYztRQUN6QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtRQUNOLHVEQUFNLENBQUE7UUFDTixtREFBSSxDQUFBO1FBQ0osaURBQUcsQ0FBQTtJQUNKLENBQUMsRUFOVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQU16QjtJQUVELE1BQU0sZUFBZTtRQUFyQjtZQUVTLGdCQUFXLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDMUMsa0JBQWEsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTJHckQsQ0FBQztRQXpHTyxVQUFVO1lBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0sZ0JBQWdCLENBQUksT0FBZ0IsRUFBRSxJQUFvQixFQUFFLFVBQXlCLEVBQUUsUUFBa0M7WUFDL0gsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hELElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDaEMsYUFBYSxHQUFHLFVBQVU7cUJBQ3hCLEtBQUssRUFBRTtxQkFDUCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDO3FCQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBQyxPQUFBLGlCQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBQSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUcsQ0FBRSxDQUFDLG1DQUFJLENBQW9CLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQUEsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFHLENBQUUsQ0FBQyxtQ0FBSSxDQUFvQixDQUFDLENBQUEsRUFBQSxDQUFDLENBQUM7Z0JBQ3BMLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUNuRDtZQUVELE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxXQUFXLENBQUksT0FBZ0IsRUFBRSxJQUFvQixFQUFFLEVBQVUsRUFBRSxVQUF5QixFQUFFLFFBQWdDLEVBQUUsR0FBWSxFQUFFLFFBQWtDOztZQUN0TCxNQUFNLE9BQU8sR0FBRyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTdFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BGLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDaEMsT0FBTyxhQUFhLENBQUM7YUFDckI7WUFFRCxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7WUFDeEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBRWhCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXZFLEtBQUssTUFBTSxNQUFNLElBQUksYUFBYSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsTUFBQSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUcsTUFBTSxDQUFDLG1DQUFJLE1BQXlCLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNqRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQixPQUFPLEVBQUUsQ0FBQztvQkFFVixJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksT0FBTyxJQUFJLEdBQUcsRUFBRTt3QkFDeEMsTUFBTTtxQkFDTjtpQkFDRDthQUNEO1lBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFFTSxVQUFVLENBQXFCLE9BQWdCLEVBQUUsSUFBb0IsRUFBRSxFQUFVLEVBQUUsTUFBVyxFQUFFLFFBQWdDO1lBQ3RJLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RSxPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNwRCxDQUFDO1FBRU0sVUFBVSxDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFFBQXFDO1lBQ3BGLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlILENBQUM7UUFFTSxXQUFXLENBQUMsT0FBZ0IsRUFBRSxFQUFVLEVBQUUsUUFBcUMsRUFBRSxHQUFZO1lBQ25HLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBYyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwSSxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFFBQXlDLEVBQUUsR0FBWTtZQUN6RyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQWdCLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFJLENBQUM7UUFFTSxRQUFRLENBQUMsT0FBZ0IsRUFBRSxFQUFVLEVBQUUsUUFBK0IsRUFBRSxHQUFZO1lBQzFGLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBVyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzSCxDQUFDO1FBRU0sUUFBUSxDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFFBQWlDLEVBQUUsR0FBWTtZQUM1RixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsQ0FBQztRQUNwSixDQUFDO1FBRU0sbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxFQUFVLEVBQUUsUUFBcUM7WUFDN0YsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDckMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBYyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUM3RyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDckIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM3QyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUzt3QkFDakMsSUFBSSxDQUFDLEdBQUcsS0FBSyxTQUFTO3dCQUN0QixJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVM7d0JBQ3pCLG9CQUFhLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRDtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLHFCQUFxQixDQUFDLE9BQWdCLEVBQUUsRUFBVSxFQUFFLFdBQXFCLEVBQUUsR0FBWTtZQUM3RixPQUFPLHVCQUFlLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdJLENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLEVBQVUsRUFBRSxXQUFvQixFQUFFLEdBQVk7WUFDM0YsT0FBTyx1QkFBZSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUM1RCxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDdkIsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLGdCQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ25DLE9BQU8sV0FBVyxDQUFDO2lCQUNuQjtnQkFFRCxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQ3JCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNULENBQUM7S0FDRDtJQUVZLFFBQUEsZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUMifQ==