var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "doodad/Doodads", "entity/IEntity", "Enums", "item/ItemRecipeRequirementChecker", "item/Items", "tile/Terrains", "utilities/enum/Enums", "utilities/math/Vector2", "utilities/TileHelpers", "./IObjective", "./ITars", "./Navigation", "./Utilities/Logger", "player/IPlayer", "newui/screen/screens/game/util/movement/PathOverlayFootPrints"], function (require, exports, Doodads_1, IEntity_1, Enums_1, ItemRecipeRequirementChecker_1, Items_1, Terrains_1, Enums_2, Vector2_1, TileHelpers_1, IObjective_1, ITars_1, Navigation_1, Logger_1, IPlayer_1, PathOverlayFootPrints_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nearBaseDistance = 10;
    const creatureRadius = 3;
    let path;
    function getPath() {
        return path;
    }
    exports.getPath = getPath;
    function setPath(p) {
        path = p;
    }
    exports.setPath = setPath;
    function getNearestTileLocation(tileType, position) {
        return __awaiter(this, void 0, void 0, function* () {
            return Navigation_1.getNavigation().getNearestTileLocation(tileType, position);
        });
    }
    exports.getNearestTileLocation = getNearestTileLocation;
    function getBestActionItem(use, preferredDamageType) {
        let possibleEquips = getPossibleHandEquips(use, preferredDamageType);
        if (possibleEquips.length === 0) {
            possibleEquips = getPossibleHandEquips(use);
        }
        if (possibleEquips.length > 0) {
            return possibleEquips[0];
        }
        return undefined;
    }
    exports.getBestActionItem = getBestActionItem;
    function getBestEquipment(equip) {
        return localPlayer.inventory.containedItems.filter(item => {
            if (item.type === Enums_1.ItemType.AnimalPelt) {
                return false;
            }
            const description = item.description();
            return description && description.equip === equip;
        }).sort((a, b) => calculateEquipItemScore(a) < calculateEquipItemScore(b) ? 1 : -1);
    }
    exports.getBestEquipment = getBestEquipment;
    function calculateEquipItemScore(item) {
        const description = item.description();
        if (!description || !description.defense) {
            return 0;
        }
        let score = description.defense.base;
        const resists = description.defense.resist;
        const vulns = description.defense.vulnerable;
        for (const damageType of Enums_2.default.values(Enums_1.DamageType)) {
            const resistValue = resists[damageType];
            if (resistValue) {
                score += resistValue;
            }
            const vulnerableValue = vulns[damageType];
            if (vulnerableValue) {
                score -= vulnerableValue;
            }
        }
        return score;
    }
    exports.calculateEquipItemScore = calculateEquipItemScore;
    function getPossibleHandEquips(use, preferredDamageType, filterEquipped) {
        return getInventoryItemsWithUse(use, filterEquipped).filter(item => {
            const description = item.description();
            return description && description.equip === Enums_1.EquipType.Held &&
                (preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
        }).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
    }
    exports.getPossibleHandEquips = getPossibleHandEquips;
    function getInventoryItemsWithUse(use, filterEquipped) {
        return localPlayer.inventory.containedItems.filter(item => {
            if (filterEquipped && item.isEquipped()) {
                return false;
            }
            const description = item.description();
            return description && description.use && description.use.indexOf(use) !== -1;
        }).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
    }
    exports.getInventoryItemsWithUse = getInventoryItemsWithUse;
    function findTarget(start, isTarget, maxTilesChecked = ITars_1.defaultMaxTilesChecked) {
        return TileHelpers_1.default.findMatchingTile(start, isTarget, maxTilesChecked, (point, tile) => {
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (terrainDescription && terrainDescription.water) {
                return false;
            }
            return true;
        });
    }
    exports.findTarget = findTarget;
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
    function findAndMoveToTarget(isTarget, moveInto = false, maxTilesChecked = ITars_1.defaultMaxTilesChecked, start = localPlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            return moveToTargetWithRetries((ignoredTiles) => findTarget(start, (point, tile) => ignoredTiles.indexOf(tile) === -1 && isTarget(point, tile), maxTilesChecked), moveInto);
        });
    }
    exports.findAndMoveToTarget = findAndMoveToTarget;
    function findAndMoveToDoodad(id, isTarget, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return findAndMoveToObject(`Doodad:${id}`, game.doodads, isTarget, moveInto);
        });
    }
    exports.findAndMoveToDoodad = findAndMoveToDoodad;
    function findAndMoveToCreature(id, isTarget, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return findAndMoveToObject(`Creature:${id}`, game.creatures.filter(c => c !== undefined && (c.ai & IEntity_1.AiType.Hidden) === 0), isTarget, moveInto);
        });
    }
    exports.findAndMoveToCreature = findAndMoveToCreature;
    function findAndMoveToCorpse(id, isTarget, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return findAndMoveToObject(`Corpse:${id}`, game.corpses, isTarget, moveInto);
        });
    }
    exports.findAndMoveToCorpse = findAndMoveToCorpse;
    function findAndMoveToObject(id, allObjects, isTarget, moveInto) {
        return __awaiter(this, void 0, void 0, function* () {
            const objects = findObjects(id, allObjects, isTarget);
            if (objects.length > 0) {
                for (let i = 0; i < Math.min(objects.length, 2); i++) {
                    const result = yield moveToTarget(objects[i], moveInto);
                    if (result === ITars_1.MoveResult.Moving || result === ITars_1.MoveResult.Complete) {
                        return result;
                    }
                }
                return ITars_1.MoveResult.NoPath;
            }
            return ITars_1.MoveResult.NoTarget;
        });
    }
    exports.findAndMoveToObject = findAndMoveToObject;
    function moveToTargetWithRetries(getTarget, moveInto = false, maxRetries = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignoredTiles = [];
            let moveResult = ITars_1.MoveResult.NoPath;
            while (moveResult === ITars_1.MoveResult.NoPath && maxRetries > 0) {
                maxRetries--;
                const target = getTarget(ignoredTiles);
                if (target) {
                    moveResult = yield moveToTarget(target, moveInto);
                    if (moveResult === ITars_1.MoveResult.NoPath) {
                        Logger_1.log("Cannot path to target, ignoring", target);
                        ignoredTiles.push(game.getTileFromPoint(target));
                    }
                    else {
                        return moveResult;
                    }
                }
                else {
                    return ITars_1.MoveResult.NoTarget;
                }
            }
            return ITars_1.MoveResult.NoTarget;
        });
    }
    exports.moveToTargetWithRetries = moveToTargetWithRetries;
    let cachedPaths;
    const movementOverlays = [];
    function resetMovementOverlays() {
        for (const tile of movementOverlays) {
            delete tile.overlay;
        }
        movementOverlays.length = 0;
    }
    exports.resetMovementOverlays = resetMovementOverlays;
    function updateOverlay(path) {
        resetMovementOverlays();
        for (let i = 1; i < path.length; i++) {
            const lastPos = path[i - 1];
            const pos = path[i];
            const nextPos = path[i + 1];
            const tile = game.getTile(pos.x, pos.y, localPlayer.z);
            tile.overlay = PathOverlayFootPrints_1.default(i, path.length, pos, lastPos, nextPos);
            if (tile.overlay) {
                movementOverlays.push(tile);
            }
        }
    }
    exports.updateOverlay = updateOverlay;
    function resetCachedPaths() {
        cachedPaths = {};
    }
    exports.resetCachedPaths = resetCachedPaths;
    function getMovementPath(target, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z) {
                return {
                    difficulty: 1
                };
            }
            let movementPath;
            const pathId = `${target.x},${target.y},${target.z}`;
            if (pathId in cachedPaths) {
                movementPath = cachedPaths[pathId];
            }
            else {
                const navigation = Navigation_1.getNavigation();
                const ends = navigation.getValidPoint(target, moveInto).sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                if (ends.length === 0) {
                    return {
                        difficulty: IObjective_1.missionImpossible
                    };
                }
                for (const end of ends) {
                    movementPath = yield navigation.findPath(end, localPlayer);
                    if (movementPath) {
                        break;
                    }
                }
                cachedPaths[pathId] = movementPath;
            }
            if (movementPath) {
                return {
                    difficulty: Vector2_1.default.squaredDistance(localPlayer, target),
                    path: movementPath
                };
            }
            return {
                difficulty: IObjective_1.missionImpossible
            };
        });
    }
    exports.getMovementPath = getMovementPath;
    function moveToTarget(target, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localPlayer.x !== target.x || localPlayer.y !== target.y || localPlayer.z !== target.z) {
                const movementPath = yield getMovementPath(target, moveInto);
                if (!movementPath.path) {
                    return ITars_1.MoveResult.NoPath;
                }
                const pathLength = movementPath.path.length;
                const end = movementPath.path[pathLength - 1];
                if (!end) {
                    Logger_1.log("Broken path!", pathLength, target.x, target.x, target.y, localPlayer.x, localPlayer.y, localPlayer.z);
                    return ITars_1.MoveResult.NoPath;
                }
                const atEnd = localPlayer.x === end.x && localPlayer.y === end.y;
                if (!atEnd) {
                    if (!localPlayer.hasWalkPath()) {
                        updateOverlay(movementPath.path);
                        localPlayer.walkAlongPath(movementPath.path);
                    }
                    return ITars_1.MoveResult.Moving;
                }
            }
            const direction = IPlayer_1.getDirectionFromMovement(target.x - localPlayer.x, target.y - localPlayer.y);
            if (direction !== localPlayer.facingDirection) {
                yield executeAction(Enums_1.ActionType.UpdateDirection, {
                    direction: direction,
                    bypass: true
                });
            }
            if (moveInto) {
                Logger_1.log(`Completed movement into ${target.x},${target.y},${target.z}`);
                yield executeAction(Enums_1.ActionType.Move, {
                    direction: direction
                });
                return ITars_1.MoveResult.Complete;
            }
            return ITars_1.MoveResult.Complete;
        });
    }
    exports.moveToTarget = moveToTarget;
    function isGoodBuildTile(base, point, tile) {
        return isOpenArea(base, point, tile) && isNearBase(base, point, tile);
    }
    exports.isGoodBuildTile = isGoodBuildTile;
    function isOpenArea(base, point, tile) {
        if (!isOpenTile(point, tile, false, false) || tile.corpses !== undefined) {
            return false;
        }
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const nearbyPoint = {
                    x: point.x + x,
                    y: point.y + y,
                    z: point.z
                };
                const nearbyTile = game.getTileFromPoint(nearbyPoint);
                if (nearbyTile.doodad) {
                    return false;
                }
                const container = tile;
                if (container.containedItems && container.containedItems.length > 0) {
                    return false;
                }
                if (!isOpenTile(nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.isOpenArea = isOpenArea;
    function getBaseDoodads(base) {
        let doodads = [];
        for (const key of Object.keys(base)) {
            const baseDoodadOrDoodads = base[key];
            if (Array.isArray(baseDoodadOrDoodads)) {
                doodads = doodads.concat(baseDoodadOrDoodads);
            }
            else {
                doodads.push(baseDoodadOrDoodads);
            }
        }
        return doodads;
    }
    exports.getBaseDoodads = getBaseDoodads;
    function hasBase(base) {
        return Object.keys(base).findIndex(key => {
            const baseDoodadOrDoodads = base[key];
            if (Array.isArray(baseDoodadOrDoodads)) {
                return baseDoodadOrDoodads.length > 0;
            }
            return baseDoodadOrDoodads !== undefined;
        }) !== -1;
    }
    exports.hasBase = hasBase;
    function isNearBase(base, point, tile) {
        if (!hasBase(base)) {
            return true;
        }
        for (let x = -nearBaseDistance; x <= nearBaseDistance; x++) {
            for (let y = -nearBaseDistance; y <= nearBaseDistance; y++) {
                const nearbyPoint = {
                    x: point.x + x,
                    y: point.y + y,
                    z: point.z
                };
                const nearbyTile = game.getTileFromPoint(nearbyPoint);
                const doodad = nearbyTile.doodad;
                if (doodad && isBaseDoodad(base, doodad)) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isNearBase = isNearBase;
    function isOpenTile(point, tile, ignoreLocalPlayer = true, allowWater = true) {
        if (tile.creature !== undefined) {
            return false;
        }
        if (tile.doodad !== undefined) {
            return false;
        }
        const terrainType = TileHelpers_1.default.getType(tile);
        const terrainInfo = Terrains_1.default[terrainType];
        if (terrainInfo) {
            if (!terrainInfo.passable && !terrainInfo.water) {
                return false;
            }
            if (!allowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
                return false;
            }
        }
        const players = game.getPlayersAtPosition(point.x, point.y, point.z, false, true);
        if (players.length > 0) {
            for (const player of players) {
                if (player !== localPlayer || (!ignoreLocalPlayer && player === localPlayer)) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.isOpenTile = isOpenTile;
    function getItemInInventory(inventory, itemTypeSearch, excludeUsefulItems = true) {
        return getItemInContainer(inventory, localPlayer.inventory, itemTypeSearch, excludeUsefulItems);
    }
    exports.getItemInInventory = getItemInInventory;
    function getItemInContainer(inventory, container, itemTypeSearch, excludeUsefulItems = true) {
        const orderedItems = itemManager.getOrderedContainerItems(container);
        for (const item of orderedItems) {
            if (excludeUsefulItems && isInventoryItem(inventory, item)) {
                continue;
            }
            if (item.type === itemTypeSearch) {
                return item;
            }
            const description = Items_1.itemDescriptions[item.type];
            if (description && description.weightCapacity !== undefined) {
                const item2 = getItemInContainer(inventory, item, itemTypeSearch, excludeUsefulItems);
                if (item2) {
                    return item2;
                }
            }
        }
        return undefined;
    }
    exports.getItemInContainer = getItemInContainer;
    function isInventoryItem(inventory, item) {
        return Object.keys(inventory).findIndex(key => {
            const itemOrItems = inventory[key];
            if (Array.isArray(itemOrItems)) {
                return itemOrItems.indexOf(item) !== -1;
            }
            return itemOrItems === item;
        }) !== -1;
    }
    exports.isInventoryItem = isInventoryItem;
    function isBaseDoodad(base, doodad) {
        return Object.keys(base).findIndex(key => {
            const baseDoodadOrDoodads = base[key];
            if (Array.isArray(baseDoodadOrDoodads)) {
                return baseDoodadOrDoodads.indexOf(doodad) !== -1;
            }
            return baseDoodadOrDoodads === doodad;
        }) !== -1;
    }
    exports.isBaseDoodad = isBaseDoodad;
    function getBasePosition(base) {
        return base.campfire || base.waterStill || base.kiln || localPlayer;
    }
    exports.getBasePosition = getBasePosition;
    function getSeeds() {
        return itemManager.getItemsInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Seed, true).filter(seed => seed.minDur !== undefined && seed.minDur > 0);
    }
    exports.getSeeds = getSeeds;
    const recipes = [];
    function resetTargetRecipes() {
        recipes.length = 0;
    }
    exports.resetTargetRecipes = resetTargetRecipes;
    function addTargetRecipe(recipe) {
        if (recipes.indexOf(recipe) === -1) {
            recipes.push(recipe);
            Logger_1.log("addTargetRecipe", recipe);
        }
    }
    exports.addTargetRecipe = addTargetRecipe;
    function processRecipe(inventory, recipe, trackItems) {
        const checker = new ItemRecipeRequirementChecker_1.default(localPlayer, recipe, trackItems);
        const items = localPlayer.inventory.containedItems.filter(i => !isInventoryItem(inventory, i));
        const container = {
            weightCapacity: localPlayer.inventory.weightCapacity,
            containedItems: items,
            itemOrders: items.map(i => i.id)
        };
        checker.processContainer(container, true);
        return checker;
    }
    exports.processRecipe = processRecipe;
    function isUsedByTargetRecipe(inventory, item) {
        for (const recipe of recipes) {
            const checker = processRecipe(inventory, recipe, true);
            if (checker.itemBaseComponent === item) {
                return true;
            }
            for (const requiredItem of checker.itemComponentsRequired) {
                if (requiredItem === item) {
                    return true;
                }
            }
            for (const consumedItem of checker.itemComponentsConsumed) {
                if (consumedItem === item) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isUsedByTargetRecipe = isUsedByTargetRecipe;
    function getDoodadTypes(doodadTypeOrGroup) {
        const doodadTypes = [];
        if (doodadManager.isDoodadTypeGroup(doodadTypeOrGroup)) {
            for (const dt of Enums_2.default.values(Enums_1.DoodadType)) {
                const doodadDescription = Doodads_1.default[dt];
                if (!doodadDescription) {
                    continue;
                }
                if (doodadDescription.group === doodadTypeOrGroup) {
                    doodadTypes.push(dt);
                }
                const lit = doodadDescription.lit;
                if (lit !== undefined) {
                    const litDoodadDescription = Doodads_1.default[lit];
                    if (litDoodadDescription && litDoodadDescription.group === doodadTypeOrGroup) {
                        doodadTypes.push(dt);
                    }
                }
                const revert = doodadDescription.revert;
                if (revert !== undefined) {
                    const revertDoodadDescription = Doodads_1.default[revert];
                    if (revertDoodadDescription && revertDoodadDescription.group === doodadTypeOrGroup) {
                        doodadTypes.push(dt);
                    }
                }
            }
        }
        else {
            doodadTypes.push(doodadTypeOrGroup);
        }
        return doodadTypes;
    }
    exports.getDoodadTypes = getDoodadTypes;
    function getUnusedItems(inventory) {
        return localPlayer.inventory.containedItems.filter(item => {
            if (item.isEquipped() || isInventoryItem(inventory, item) || isUsedByTargetRecipe(inventory, item)) {
                return false;
            }
            const description = item.description();
            if (description && description.use && (description.use.indexOf(Enums_1.ActionType.GatherWater) !== -1 || description.use.indexOf(Enums_1.ActionType.DrinkItem) !== -1)) {
                return false;
            }
            return true;
        }).sort((a, b) => a.weight < b.weight ? 1 : -1);
    }
    exports.getUnusedItems = getUnusedItems;
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
    const pendingActions = {};
    function waitForAction(actionType) {
        return new Promise(resolve => {
            const rejectorId = setTimeout(() => {
                delete pendingActions[actionType];
                resolve(false);
            }, 1000);
            pendingActions[actionType] = {
                resolve: resolve,
                rejectorTimeoutId: rejectorId
            };
        });
    }
    exports.waitForAction = waitForAction;
    function postExecuteAction(actionType) {
        const pendingAction = pendingActions[actionType];
        if (pendingAction) {
            clearTimeout(pendingAction.rejectorTimeoutId);
            delete pendingActions[actionType];
            pendingAction.resolve(true);
        }
    }
    exports.postExecuteAction = postExecuteAction;
    function executeAction(actionType, executeArgument) {
        return __awaiter(this, void 0, void 0, function* () {
            let waiter;
            if (localPlayer.hasDelay()) {
                yield new Promise(resolve => {
                    const checker = () => {
                        if (!localPlayer.hasDelay()) {
                            resolve();
                            return;
                        }
                        setTimeout(checker, 10);
                    };
                    checker();
                });
            }
            if (multiplayer.isConnected()) {
                waiter = waitForAction(actionType);
            }
            actionManager.execute(localPlayer, actionType, executeArgument);
            if (waiter) {
                yield waiter;
            }
        });
    }
    exports.executeAction = executeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9IZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBdUJBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBRTVCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztJQUV6QixJQUFJLElBQVksQ0FBQztJQU9qQjtRQUNDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUZELDBCQUVDO0lBRUQsaUJBQXdCLENBQVM7UUFDaEMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNWLENBQUM7SUFGRCwwQkFFQztJQUVELGdDQUE2QyxRQUFxQixFQUFFLFFBQWtCOztZQUNyRixPQUFPLDBCQUFhLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUFBO0lBRkQsd0RBRUM7SUFFRCwyQkFBa0MsR0FBZSxFQUFFLG1CQUFnQztRQUNsRixJQUFJLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUNyRSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBRWhDLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekI7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBWkQsOENBWUM7SUFFRCwwQkFBaUMsS0FBZ0I7UUFDaEQsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsVUFBVSxFQUFFO2dCQUV0QyxPQUFPLEtBQUssQ0FBQzthQUNiO1lB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