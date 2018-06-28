var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "doodad/Doodads", "entity/IEntity", "Enums", "item/ItemRecipeRequirementChecker", "item/Items", "tile/Terrains", "utilities/enum/Enums", "utilities/math/Vector2", "utilities/TileHelpers", "./IObjective", "./ITars", "./Navigation", "./Utilities/Logger", "player/IPlayer"], function (require, exports, Doodads_1, IEntity_1, Enums_1, ItemRecipeRequirementChecker_1, Items_1, Terrains_1, Enums_2, Vector2_1, TileHelpers_1, IObjective_1, ITars_1, Navigation_1, Logger_1, IPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nearBaseDistance = 10;
    const creatureRadius = 3;
    const green = {
        r: 0,
        g: 255,
        b: 0
    };
    const lightBlue = {
        r: 0,
        g: 255,
        b: 255
    };
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
    let movementIntent;
    let processNextInput;
    function shouldProcessNextInput() {
        if (processNextInput) {
            processNextInput = false;
            return true;
        }
        return false;
    }
    exports.shouldProcessNextInput = shouldProcessNextInput;
    function resetMovementIntent() {
        movementIntent = undefined;
    }
    exports.resetMovementIntent = resetMovementIntent;
    function getMovementIntent() {
        return movementIntent;
    }
    exports.getMovementIntent = getMovementIntent;
    function setMovementIntent(mi) {
        processNextInput = true;
        movementIntent = mi;
        localPlayer.updateMovementIntent(movementIntent);
    }
    exports.setMovementIntent = setMovementIntent;
    function shouldUseMovementIntent() {
        return false;
    }
    exports.shouldUseMovementIntent = shouldUseMovementIntent;
    let cachedPaths;
    function resetCachedPaths() {
        cachedPaths = {};
    }
    exports.resetCachedPaths = resetCachedPaths;
    function calculateDifficultyMoveToTarget(target, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z) {
                return 1;
            }
            let movementPath;
            const pathId = `${target.x},${target.y},${target.z}`;
            if (pathId in cachedPaths) {
                movementPath = cachedPaths[pathId];
            }
            else {
                const navigation = Navigation_1.getNavigation();
                let ends = navigation.getValidPoint(target);
                if (ends.length === 0) {
                    return ITars_1.MoveResult.NoPath;
                }
                ends = ends.sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                movementPath = yield navigation.findPath(ends[0], localPlayer);
                cachedPaths[pathId] = movementPath;
            }
            if (movementPath) {
                Logger_1.log("calculateDifficultyMoveToTarget", movementPath.length, Vector2_1.default.squaredDistance(localPlayer, target));
                return Vector2_1.default.squaredDistance(localPlayer, target);
            }
            return IObjective_1.missionImpossible;
        });
    }
    exports.calculateDifficultyMoveToTarget = calculateDifficultyMoveToTarget;
    function moveToTarget(target, moveInto = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z) {
                if (moveInto) {
                    Logger_1.log(`Completed movement into ${target.x},${target.y},${target.z}`);
                    return ITars_1.MoveResult.Complete;
                }
                if (localPlayer.facingDirection !== Enums_1.Direction.None) {
                    const facingDirection = game.directionToMovement(localPlayer.facingDirection);
                    if (localPlayer.direction.x === facingDirection.x && localPlayer.direction.y === facingDirection.y) {
                        const facingTile = localPlayer.getFacingTile();
                        if (facingTile === game.getTileFromPoint(target)) {
                            return ITars_1.MoveResult.Complete;
                        }
                    }
                }
                Logger_1.log(`Moving to adjacent tile near ${target.x},${target.y},${target.z}`);
                for (const direction of Enums_2.default.values(Enums_1.Direction)) {
                    if (direction === Enums_1.Direction.None) {
                        continue;
                    }
                    const directionMovement = game.directionToMovement(direction);
                    if (isOpenTile({
                        x: localPlayer.x + directionMovement.x,
                        y: localPlayer.y + directionMovement.y,
                        z: localPlayer.z
                    }, game.getTile(localPlayer.x + directionMovement.x, localPlayer.y + directionMovement.y, localPlayer.z))) {
                        if (localPlayer.facingDirection === direction) {
                            yield executeAction(Enums_1.ActionType.Move, {
                                direction: direction
                            });
                        }
                        else {
                            Logger_1.log(`Changing direction from ${Enums_1.Direction[localPlayer.facingDirection]} to ${Enums_1.Direction[direction]}`);
                            yield executeAction(Enums_1.ActionType.UpdateDirection, {
                                direction: direction,
                                bypass: true
                            });
                        }
                        return ITars_1.MoveResult.Moving;
                    }
                }
                Logger_1.log(`Giving up movement into ${target.x},${target.y},${target.z}`);
                return ITars_1.MoveResult.Complete;
            }
            let movementPath;
            const pathId = `${target.x},${target.y},${target.z}`;
            if (pathId in cachedPaths) {
                movementPath = cachedPaths[pathId];
            }
            else {
                const navigation = Navigation_1.getNavigation();
                let ends = navigation.getValidPoint(target);
                if (ends.length === 0) {
                    return ITars_1.MoveResult.NoPath;
                }
                ends = ends.sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                movementPath = yield navigation.findPath(ends[0], localPlayer);
                cachedPaths[pathId] = movementPath;
            }
            if (!movementPath) {
                return ITars_1.MoveResult.NoPath;
            }
            const pathLength = movementPath.length;
            const end = movementPath[pathLength - 1];
            if (!end) {
                Logger_1.log("Broken path!", pathLength, localPlayer.x, localPlayer.y, localPlayer.z, pathId);
                return ITars_1.MoveResult.NoPath;
            }
            const endIsTarget = target.x === end.x && target.y === end.y;
            const atEnd = localPlayer.x === end.x && localPlayer.y === end.y;
            let nextMove = movementPath[1];
            let shouldMove;
            if (endIsTarget) {
                shouldMove = (moveInto && pathLength >= 1) || pathLength > 2;
            }
            else {
                shouldMove = (moveInto && pathLength >= 1) || pathLength >= 2;
                if (atEnd) {
                    nextMove = target;
                }
            }
            if (!atEnd) {
                for (let i = 0; i < movementPath.length; i++) {
                    const point = movementPath[i];
                    const isEnd = i === movementPath.length - 1;
                    game.particle.createMultiple(point.x, point.y, localPlayer.z, isEnd ? green : lightBlue, 1, isEnd ? 5 : 1, true);
                }
            }
            if (!shouldMove) {
                nextMove = target;
            }
            const direction = IPlayer_1.getDirectionFromMovement(nextMove.x - localPlayer.x, nextMove.y - localPlayer.y);
            if (shouldUseMovementIntent()) {
                let intent;
                if (!localPlayer.faceDirection(direction, true)) {
                    intent = direction;
                }
                setMovementIntent({ intent: intent, shouldDisableTurnDelay: true });
            }
            else {
                if (localPlayer.facingDirection === direction) {
                    if (shouldMove) {
                        yield executeAction(Enums_1.ActionType.Move, {
                            direction: direction
                        });
                    }
                }
                else {
                    Logger_1.log(`Changing direction from ${Enums_1.Direction[localPlayer.facingDirection]} to ${Enums_1.Direction[direction]}`);
                    yield executeAction(Enums_1.ActionType.UpdateDirection, {
                        direction: direction,
                        bypass: true
                    });
                }
            }
            if (!shouldMove) {
                Logger_1.log(`Completed movement to ${target.x},${target.y},${target.z}`);
                return ITars_1.MoveResult.Complete;
            }
            return ITars_1.MoveResult.Moving;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9IZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBc0JBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBRTVCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztJQUV6QixNQUFNLEtBQUssR0FBUztRQUNuQixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxHQUFHO1FBQ04sQ0FBQyxFQUFFLENBQUM7S0FDSixDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQVM7UUFDdkIsQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsR0FBRztRQUNOLENBQUMsRUFBRSxHQUFHO0tBQ04sQ0FBQztJQUVGLElBQUksSUFBWSxDQUFDO0lBRWpCO1FBQ0MsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRkQsMEJBRUM7SUFFRCxpQkFBd0IsQ0FBUztRQUNoQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUZELDBCQUVDO0lBRUQsZ0NBQTZDLFFBQXFCLEVBQUUsUUFBa0I7O1lBQ3JGLE9BQU8sMEJBQWEsRUFBRSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFGRCx3REFFQztJQUVELDJCQUFrQyxHQUFlLEVBQUUsbUJBQWdDO1FBQ2xGLElBQUksY0FBYyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JFLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFFaEMsY0FBYyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM5QixPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QjtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFaRCw4Q0FZQztJQUVELDBCQUFpQyxLQUFnQjtRQUNoRCxPQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBRXRDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsT0FBTyxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBVkQsNENBVUM7SUFFRCxpQ0FBd0MsSUFBVztRQUNsRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7WUFDekMsT0FBTyxDQUFDLENBQUM7U0FDVDtRQUVELElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRXJDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzNDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBRTdDLEtBQUssTUFBTSxVQUFVLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBVSxDQUFDLEVBQUU7WUFDbEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLElBQUksV0FBVyxFQUFFO2dCQUNoQixLQUFLLElBQUksV0FBVyxDQUFDO2FBQ3JCO1lBRUQsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLElBQUksZUFBZSxFQUFFO2dCQUNwQixLQUFLLElBQUksZUFBZSxDQUFDO2FBQ3pCO1NBQ0Q7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUF4QkQsMERBd0JDO0lBRUQsK0JBQXNDLEdBQWUsRUFBRSxtQkFBZ0MsRUFBRSxjQUF3QjtRQUNoSCxPQUFPLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLE9BQU8sV0FBVyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssaUJBQVMsQ0FBQyxJQUFJO2dCQUN6RCxDQUFDLG1CQUFtQixLQUFLLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRyxDQUFDO0lBTkQsc0RBTUM7SUFFRCxrQ0FBeUMsR0FBZSxFQUFFLGNBQXdCO1FBQ2pGLE9BQU8sV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pELElBQUksY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDeEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxPQUFPLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRyxDQUFDO0lBVEQsNERBU0M7SUFFRCxvQkFBMkIsS0FBZSxFQUFFLFFBQW1ELEVBQUUsa0JBQTBCLDhCQUFzQjtRQUNoSixPQUFPLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDckYsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFO2dCQUNuRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFWRCxnQ0FVQztJQUVELElBQUksYUFBbUQsQ0FBQztJQUV4RDtRQUNDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUZELGdEQUVDO0lBRUQscUJBQWdELEVBQVUsRUFBRSxVQUFlLEVBQUUsUUFBZ0M7UUFDNUcsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksYUFBYSxFQUFFO1lBQ2xCLE9BQU8sYUFBYSxDQUFDO1NBQ3JCO1FBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxTSxhQUFhLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRTNCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVhELGtDQVdDO0lBQ0Qsb0JBQStDLEVBQVUsRUFBRSxNQUFXLEVBQUUsUUFBZ0M7UUFDdkcsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDcEQsQ0FBQztJQUhELGdDQUdDO0lBRUQsb0JBQTJCLEVBQVUsRUFBRSxRQUFzQztRQUM1RSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFGRCxnQ0FFQztJQUVELHFCQUE0QixFQUFVLEVBQUUsUUFBc0M7UUFDN0UsT0FBTyxXQUFXLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRkQsa0NBRUM7SUFFRCxzQkFBNkIsRUFBVSxFQUFFLFFBQTBDO1FBQ2xGLE9BQU8sVUFBVSxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQXdCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUZELG9DQUVDO0lBRUQsb0JBQTJCLEVBQVUsRUFBRSxRQUFzQztRQUM1RSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFGRCxnQ0FFQztJQUVELDZCQUEwQyxRQUFtRCxFQUFFLFdBQW9CLEtBQUssRUFBRSxrQkFBMEIsOEJBQXNCLEVBQUUsUUFBa0IsV0FBVzs7WUFDeE0sT0FBTyx1QkFBdUIsQ0FBQyxDQUFDLFlBQXFCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEwsQ0FBQztLQUFBO0lBRkQsa0RBRUM7SUFFRCw2QkFBMEMsRUFBVSxFQUFFLFFBQXNDLEVBQUUsV0FBb0IsS0FBSzs7WUFDdEgsT0FBTyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRixDQUFDO0tBQUE7SUFGRCxrREFFQztJQUVELCtCQUE0QyxFQUFVLEVBQUUsUUFBMEMsRUFBRSxXQUFvQixLQUFLOztZQUM1SCxPQUFPLG1CQUFtQixDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUcsSUFBSSxDQUFDLFNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEssQ0FBQztLQUFBO0lBRkQsc0RBRUM7SUFFRCw2QkFBMEMsRUFBVSxFQUFFLFFBQXNDLEVBQUUsV0FBb0IsS0FBSzs7WUFDdEgsT0FBTyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFvQixFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRixDQUFDO0tBQUE7SUFGRCxrREFFQztJQUVELDZCQUE4RCxFQUFVLEVBQUUsVUFBZSxFQUFFLFFBQWdDLEVBQUUsUUFBaUI7O1lBQzdJLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3JELE1BQU0sTUFBTSxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxNQUFNLEtBQUssa0JBQVUsQ0FBQyxNQUFNLElBQUksTUFBTSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUNuRSxPQUFPLE1BQU0sQ0FBQztxQkFDZDtpQkFDRDtnQkFFRCxPQUFPLGtCQUFVLENBQUMsTUFBTSxDQUFDO2FBQ3pCO1lBRUQsT0FBTyxrQkFBVSxDQUFDLFFBQVEsQ0FBQztRQUM1QixDQUFDO0tBQUE7SUFkRCxrREFjQztJQUVELGlDQUE4QyxTQUEwRCxFQUFFLFdBQW9CLEtBQUssRUFBRSxhQUFxQixDQUFDOztZQUMxSixNQUFNLFlBQVksR0FBWSxFQUFFLENBQUM7WUFFakMsSUFBSSxVQUFVLEdBQUcsa0JBQVUsQ0FBQyxNQUFNLENBQUM7WUFDbkMsT0FBTyxVQUFVLEtBQUssa0JBQVUsQ0FBQyxNQUFNLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTtnQkFDMUQsVUFBVSxFQUFFLENBQUM7Z0JBRWIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLE1BQU0sRUFBRTtvQkFDWCxVQUFVLEdBQUcsTUFBTSxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNsRCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDckMsWUFBRyxDQUFDLGlDQUFpQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUMvQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3FCQUVqRDt5QkFBTTt3QkFDTixPQUFPLFVBQVUsQ0FBQztxQkFDbEI7aUJBRUQ7cUJBQU07b0JBQ04sT0FBTyxrQkFBVSxDQUFDLFFBQVEsQ0FBQztpQkFDM0I7YUFDRDtZQUVELE9BQU8sa0JBQVUsQ0FBQyxRQUFRLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBeEJELDBEQXdCQztJQUVELElBQUksY0FBMkMsQ0FBQztJQUNoRCxJQUFJLGdCQUF5QixDQUFDO0lBRTlCO1FBQ0MsSUFBSSxnQkFBZ0IsRUFBRTtZQUNyQixnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDekIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQVBELHdEQU9DO0lBRUQ7UUFDQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBQzVCLENBQUM7SUFGRCxrREFFQztJQUVEO1FBQ0MsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUZELDhDQUVDO0lBRUQsMkJBQWtDLEVBQW1CO1FBQ3BELGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUV4QixjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBTEQsOENBS0M7SUFFRDtRQUNDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUZELDBEQUVDO0lBRUQsSUFBSSxXQUF3RCxDQUFDO0lBRTdEO1FBQ0MsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRkQsNENBRUM7SUFFRCx5Q0FBc0QsTUFBZ0IsRUFBRSxXQUFvQixLQUFLOztZQUNoRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFO2dCQUMzRixPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsSUFBSSxZQUFvQyxDQUFDO1lBRXpDLE1BQU0sTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNyRCxJQUFJLE1BQU0sSUFBSSxXQUFXLEVBQUU7Z0JBQzFCLFlBQVksR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7YUFFbkM7aUJBQU07Z0JBQ04sTUFBTSxVQUFVLEdBQUcsMEJBQWEsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN0QixPQUFPLGtCQUFVLENBQUMsTUFBTSxDQUFDO2lCQUN6QjtnQkFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkgsWUFBWSxHQUFHLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBRS9ELFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUM7YUFDbkM7WUFFRCxJQUFJLFlBQVksRUFBRTtnQkFDakIsWUFBRyxDQUFDLGlDQUFpQyxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzFHLE9BQU8saUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3BEO1lBRUQsT0FBTyw4QkFBaUIsQ0FBQztRQUMxQixDQUFDO0tBQUE7SUEvQkQsMEVBK0JDO0lBRUQsc0JBQW1DLE1BQWdCLEVBQUUsV0FBb0IsS0FBSzs7WUFDN0UsSUFBSSxXQUFXLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRTtnQkFHM0YsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsWUFBRyxDQUFDLDJCQUEyQixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ25FLE9BQU8sa0JBQVUsQ0FBQyxRQUFRLENBQUM7aUJBQzNCO2dCQUVELElBQUksV0FBVyxDQUFDLGVBQWUsS0FBSyxpQkFBUyxDQUFDLElBQUksRUFBRTtvQkFDbkQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDOUUsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxlQUFlLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLGVBQWUsQ0FBQyxDQUFDLEVBQUU7d0JBQ25HLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQzt3QkFDL0MsSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUNqRCxPQUFPLGtCQUFVLENBQUMsUUFBUSxDQUFDO3lCQUMzQjtxQkFDRDtpQkFDRDtnQkFFRCxZQUFHLENBQUMsZ0NBQWdDLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFHeEUsS0FBSyxNQUFNLFNBQVMsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFTLENBQUMsRUFBRTtvQkFDaEQsSUFBSSxTQUFTLEtBQUssaUJBQVMsQ0FBQyxJQUFJLEVBQUU7d0JBQ2pDLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRTlELElBQUksVUFBVSxDQUFDO3dCQUNkLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUM7d0JBQ3RDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUM7d0JBQ3RDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztxQkFDaEIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUMxRyxJQUFJLFdBQVcsQ0FBQyxlQUFlLEtBQUssU0FBUyxFQUFFOzRCQUM5QyxNQUFNLGFBQWEsQ0FBQyxrQkFBVSxDQUFDLElBQUksRUFBRTtnQ0FDcEMsU0FBUyxFQUFFLFNBQVM7NkJBQ3BCLENBQUMsQ0FBQzt5QkFFSDs2QkFBTTs0QkFDTixZQUFHLENBQUMsMkJBQTJCLGlCQUFTLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxPQUFPLGlCQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRCQUNwRyxNQUFNLGFBQWEsQ0FBQyxrQkFBVSxDQUFDLGVBQWUsRUFBRTtnQ0FDL0MsU0FBUyxFQUFFLFNBQVM7Z0NBQ3BCLE1BQU0sRUFBRSxJQUFJOzZCQUNaLENBQUMsQ0FBQzt5QkFDSDt3QkFFRCxPQUFPLGtCQUFVLENBQUMsTUFBTSxDQUFDO3FCQUN6QjtpQkFDRDtnQkFFRCxZQUFHLENBQUMsMkJBQTJCLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFbkUsT0FBTyxrQkFBVSxDQUFDLFFBQVEsQ0FBQzthQUMzQjtZQUVELElBQUksWUFBb0MsQ0FBQztZQUV6QyxNQUFNLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDckQsSUFBSSxNQUFNLElBQUksV0FBVyxFQUFFO2dCQUMxQixZQUFZLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBRW5DO2lCQUFNO2dCQUNOLE1BQU0sVUFBVSxHQUFHLDBCQUFhLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDdEIsT0FBTyxrQkFBVSxDQUFDLE1BQU0sQ0FBQztpQkFDekI7Z0JBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZILFlBQVksR0FBRyxNQUFNLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUUvRCxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDO2FBQ25DO1lBRUQsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTyxrQkFBVSxDQUFDLE1BQU0sQ0FBQzthQUN6QjtZQUVELE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFFdkMsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULFlBQUcsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRixPQUFPLGtCQUFVLENBQUMsTUFBTSxDQUFDO2FBQ3pCO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWpFLElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUkvQixJQUFJLFVBQW1CLENBQUM7WUFDeEIsSUFBSSxXQUFXLEVBQUU7Z0JBQ2hCLFVBQVUsR0FBRyxDQUFDLFFBQVEsSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQzthQUU3RDtpQkFBTTtnQkFDTixVQUFVLEdBQUcsQ0FBQyxRQUFRLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLFVBQVUsSUFBSSxDQUFDLENBQUM7Z0JBRTlELElBQUksS0FBSyxFQUFFO29CQUNWLFFBQVEsR0FBRyxNQUFNLENBQUM7aUJBQ2xCO2FBQ0Q7WUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM3QyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDakg7YUFDRDtZQUlELElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLFFBQVEsR0FBRyxNQUFNLENBQUM7YUFDbEI7WUFFRCxNQUFNLFNBQVMsR0FBRyxrQ0FBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbkcsSUFBSSx1QkFBdUIsRUFBRSxFQUFFO2dCQUM5QixJQUFJLE1BQWtDLENBQUM7Z0JBRXZDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDaEQsTUFBTSxHQUFHLFNBQVMsQ0FBQztpQkFDbkI7Z0JBRUQsaUJBQWlCLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFFcEU7aUJBQU07Z0JBQ04sSUFBSSxXQUFXLENBQUMsZUFBZSxLQUFLLFNBQVMsRUFBRTtvQkFDOUMsSUFBSSxVQUFVLEVBQUU7d0JBQ2YsTUFBTSxhQUFhLENBQUMsa0JBQVUsQ0FBQyxJQUFJLEVBQUU7NEJBQ3BDLFNBQVMsRUFBRSxTQUFTO3lCQUNwQixDQUFDLENBQUM7cUJBQ0g7aUJBRUQ7cUJBQU07b0JBQ04sWUFBRyxDQUFDLDJCQUEyQixpQkFBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsT0FBTyxpQkFBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEcsTUFBTSxhQUFhLENBQUMsa0JBQVUsQ0FBQyxlQUFlLEVBQUU7d0JBQy9DLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixNQUFNLEVBQUUsSUFBSTtxQkFDWixDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUVELElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLFlBQUcsQ0FBQyx5QkFBeUIsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRSxPQUFPLGtCQUFVLENBQUMsUUFBUSxDQUFDO2FBQzNCO1lBRUQsT0FBTyxrQkFBVSxDQUFDLE1BQU0sQ0FBQztRQUMxQixDQUFDO0tBQUE7SUEzSkQsb0NBMkpDO0lBRUQseUJBQWdDLElBQVcsRUFBRSxLQUFlLEVBQUUsSUFBVztRQUN4RSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFGRCwwQ0FFQztJQUVELG9CQUEyQixJQUFXLEVBQUUsS0FBZSxFQUFFLElBQVc7UUFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUN6RSxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0IsTUFBTSxXQUFXLEdBQWE7b0JBQzdCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ2QsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDZCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ1YsQ0FBQztnQkFFRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3RELElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDdEIsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsSUFBa0IsQ0FBQztnQkFDckMsSUFBSSxTQUFTLENBQUMsY0FBYyxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDcEUsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDeEUsT0FBTyxLQUFLLENBQUM7aUJBQ2I7YUFDRDtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBOUJELGdDQThCQztJQUVELHdCQUErQixJQUFXO1FBQ3pDLElBQUksT0FBTyxHQUFjLEVBQUUsQ0FBQztRQUU1QixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxtQkFBbUIsR0FBeUIsSUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BFLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBRTlDO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUNsQztTQUNEO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQWRELHdDQWNDO0lBRUQsaUJBQXdCLElBQVc7UUFDbEMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QyxNQUFNLG1CQUFtQixHQUF5QixJQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUN0QztZQUVELE9BQU8sbUJBQW1CLEtBQUssU0FBUyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQVRELDBCQVNDO0lBRUQsb0JBQTJCLElBQVcsRUFBRSxLQUFlLEVBQUUsSUFBVztRQUNuRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNELE1BQU0sV0FBVyxHQUFhO29CQUM3QixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNkLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ2QsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNWLENBQUM7Z0JBRUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUNqQyxJQUFJLE1BQU0sSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO29CQUN6QyxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUF0QkQsZ0NBc0JDO0lBRUQsb0JBQTJCLEtBQWUsRUFBRSxJQUFXLEVBQUUsb0JBQTZCLElBQUksRUFBRSxhQUFzQixJQUFJO1FBQ3JILElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDaEMsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDOUIsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELE1BQU0sV0FBVyxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLE1BQU0sV0FBVyxHQUFHLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsSUFBSSxXQUFXLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO2dCQUNoRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNuRSxPQUFPLEtBQUssQ0FBQzthQUNiO1NBQ0Q7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xGLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdkIsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7Z0JBQzdCLElBQUksTUFBTSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsaUJBQWlCLElBQUksTUFBTSxLQUFLLFdBQVcsQ0FBQyxFQUFFO29CQUM3RSxPQUFPLEtBQUssQ0FBQztpQkFDYjthQUNEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUEvQkQsZ0NBK0JDO0lBRUQsNEJBQW1DLFNBQTBCLEVBQUUsY0FBd0IsRUFBRSxxQkFBOEIsSUFBSTtRQUMxSCxPQUFPLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFGRCxnREFFQztJQUVELDRCQUFtQyxTQUEwQixFQUFFLFNBQXFCLEVBQUUsY0FBd0IsRUFBRSxxQkFBOEIsSUFBSTtRQUNqSixNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckUsS0FBSyxNQUFNLElBQUksSUFBSSxZQUFZLEVBQUU7WUFDaEMsSUFBSSxrQkFBa0IsSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUMzRCxTQUFTO2FBQ1Q7WUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFO2dCQUNqQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxXQUFXLEdBQUcsd0JBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzVELE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxJQUFrQixFQUFFLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNwRyxJQUFJLEtBQUssRUFBRTtvQkFDVixPQUFPLEtBQUssQ0FBQztpQkFDYjthQUNEO1NBQ0Q7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBckJELGdEQXFCQztJQUVELHlCQUFnQyxTQUEwQixFQUFFLElBQVc7UUFDdEUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3QyxNQUFNLFdBQVcsR0FBcUIsU0FBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUN4QztZQUVELE9BQU8sV0FBVyxLQUFLLElBQUksQ0FBQztRQUM3QixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFURCwwQ0FTQztJQUVELHNCQUE2QixJQUFXLEVBQUUsTUFBZTtRQUN4RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sbUJBQW1CLEdBQXlCLElBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDdkMsT0FBTyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxPQUFPLG1CQUFtQixLQUFLLE1BQU0sQ0FBQztRQUN2QyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFURCxvQ0FTQztJQUVELHlCQUFnQyxJQUFXO1FBQzFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDO0lBQ3JFLENBQUM7SUFGRCwwQ0FFQztJQUVEO1FBQ0MsT0FBTyxXQUFXLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxxQkFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdKLENBQUM7SUFGRCw0QkFFQztJQUVELE1BQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztJQUU5QjtRQUNDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFGRCxnREFFQztJQUVELHlCQUFnQyxNQUFlO1FBQzlDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJCLFlBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMvQjtJQUNGLENBQUM7SUFORCwwQ0FNQztJQUVELHVCQUE4QixTQUEwQixFQUFFLE1BQWUsRUFBRSxVQUFtQjtRQUM3RixNQUFNLE9BQU8sR0FBRyxJQUFJLHNDQUE0QixDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFJbEYsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0YsTUFBTSxTQUFTLEdBQWU7WUFDN0IsY0FBYyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYztZQUNwRCxjQUFjLEVBQUUsS0FBSztZQUNyQixVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDaEMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFHMUMsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQWZELHNDQWVDO0lBRUQsOEJBQXFDLFNBQTBCLEVBQUUsSUFBVztRQUMzRSxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM3QixNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV2RCxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxLQUFLLE1BQU0sWUFBWSxJQUFJLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRTtnQkFDMUQsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO29CQUMxQixPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsS0FBSyxNQUFNLFlBQVksSUFBSSxPQUFPLENBQUMsc0JBQXNCLEVBQUU7Z0JBQzFELElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtvQkFDMUIsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtTQUNEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBdEJELG9EQXNCQztJQUVELHdCQUErQixpQkFBK0M7UUFDN0UsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztRQUVyQyxJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ3ZELEtBQUssTUFBTSxFQUFFLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBVSxDQUFDLEVBQUU7Z0JBQzFDLE1BQU0saUJBQWlCLEdBQUcsaUJBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUN2QixTQUFTO2lCQUNUO2dCQUVELElBQUksaUJBQWlCLENBQUMsS0FBSyxLQUFLLGlCQUFpQixFQUFFO29CQUNsRCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNyQjtnQkFFRCxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUM7Z0JBQ2xDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtvQkFDdEIsTUFBTSxvQkFBb0IsR0FBRyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLG9CQUFvQixJQUFJLG9CQUFvQixDQUFDLEtBQUssS0FBSyxpQkFBaUIsRUFBRTt3QkFDN0UsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDckI7aUJBQ0Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2dCQUN4QyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3pCLE1BQU0sdUJBQXVCLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDaEQsSUFBSSx1QkFBdUIsSUFBSSx1QkFBdUIsQ0FBQyxLQUFLLEtBQUssaUJBQWlCLEVBQUU7d0JBQ25GLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3JCO2lCQUNEO2FBQ0Q7U0FFRDthQUFNO1lBQ04sV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3BDO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQXBDRCx3Q0FvQ0M7SUFFRCx3QkFBK0IsU0FBMEI7UUFDeEQsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25HLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN2SixPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBYkQsd0NBYUM7SUFFRCwyQkFBa0MsS0FBZTtRQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUNyQjthQUNEO1NBQ0Q7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBWEQsOENBV0M7SUFFRCxNQUFNLGNBQWMsR0FLaEIsRUFBRSxDQUFDO0lBRVAsdUJBQThCLFVBQXNCO1FBQ25ELE9BQU8sSUFBSSxPQUFPLENBQVUsT0FBTyxDQUFDLEVBQUU7WUFDckMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDbEMsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFVCxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUc7Z0JBQzVCLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixpQkFBaUIsRUFBRSxVQUFVO2FBQzdCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFaRCxzQ0FZQztJQUVELDJCQUFrQyxVQUFzQjtRQUN2RCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsSUFBSSxhQUFhLEVBQUU7WUFDbEIsWUFBWSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7SUFDRixDQUFDO0lBUEQsOENBT0M7SUFFRCx1QkFBb0MsVUFBc0IsRUFBRSxlQUFpQzs7WUFDNUYsSUFBSSxNQUFvQyxDQUFDO1lBRXpDLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUMzQixNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMzQixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7d0JBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUU7NEJBQzVCLE9BQU8sRUFBRSxDQUFDOzRCQUNWLE9BQU87eUJBQ1A7d0JBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDO29CQUVGLE9BQU8sRUFBRSxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFFOUIsTUFBTSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNuQztZQUVELGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUVoRSxJQUFJLE1BQU0sRUFBRTtnQkFDWCxNQUFNLE1BQU0sQ0FBQzthQUNiO1FBQ0YsQ0FBQztLQUFBO0lBNUJELHNDQTRCQyJ9