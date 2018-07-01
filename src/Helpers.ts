import { ExecuteArgument } from "action/IAction";
import { ICorpse } from "creature/corpse/ICorpse";
import { ICreature } from "creature/ICreature";
import Doodads from "doodad/Doodads";
import { IDoodad } from "doodad/IDoodad";
import { AiType } from "entity/IEntity";
import { ActionType, DamageType, DoodadType, DoodadTypeGroup, EquipType, ItemType, ItemTypeGroup, TerrainType } from "Enums";
import { IContainer, IItem, IRecipe } from "item/IItem";
import ItemRecipeRequirementChecker from "item/ItemRecipeRequirementChecker";
import { itemDescriptions as Items } from "item/Items";
import { ITile } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import Enums from "utilities/enum/Enums";
import { IVector2, IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";
import { missionImpossible } from "./IObjective";
import { defaultMaxTilesChecked, IBase, IInventoryItems, ITileLocation, MoveResult } from "./ITars";
import { getNavigation } from "./Navigation";
import { log } from "./Utilities/Logger";
import { getDirectionFromMovement } from "player/IPlayer";
import PathOverlayFootPrints from "newui/screen/screens/game/util/movement/PathOverlayFootPrints";

const nearBaseDistance = 10;

const creatureRadius = 3;

let path: string;

export interface IMovementPath {
	difficulty: number;
	path?: IVector2[];
}

export function getPath() {
	return path;
}

export function setPath(p: string) {
	path = p;
}

export async function getNearestTileLocation(tileType: TerrainType, position: IVector3): Promise<ITileLocation[]> {
	return getNavigation().getNearestTileLocation(tileType, position);
}

export function getBestActionItem(use: ActionType, preferredDamageType?: DamageType): IItem | undefined {
	let possibleEquips = getPossibleHandEquips(use, preferredDamageType);
	if (possibleEquips.length === 0) {
		// fall back to not caring about the damage type
		possibleEquips = getPossibleHandEquips(use);
	}

	if (possibleEquips.length > 0) {
		return possibleEquips[0];
	}

	return undefined;
}

export function getBestEquipment(equip: EquipType): IItem[] {
	return localPlayer.inventory.containedItems.filter(item => {
		if (item.type === ItemType.AnimalPelt) {
			// we're not savages
			return false;
		}

		const description = item.description();
		return description && description.equip === equip;
	}).sort((a, b) => calculateEquipItemScore(a) < calculateEquipItemScore(b) ? 1 : -1);
}

export function calculateEquipItemScore(item: IItem): number {
	const description = item.description();
	if (!description || !description.defense) {
		return 0;
	}

	let score = description.defense.base;

	const resists = description.defense.resist;
	const vulns = description.defense.vulnerable;

	for (const damageType of Enums.values(DamageType)) {
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

export function getPossibleHandEquips(use: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): IItem[] {
	return getInventoryItemsWithUse(use, filterEquipped).filter(item => {
		const description = item.description();
		return description && description.equip === EquipType.Held &&
			(preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
	}).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
}

export function getInventoryItemsWithUse(use: ActionType, filterEquipped?: boolean): IItem[] {
	return localPlayer.inventory.containedItems.filter(item => {
		if (filterEquipped && item.isEquipped()) {
			return false;
		}

		const description = item.description();
		return description && description.use && description.use.indexOf(use) !== -1;
	}).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
}

export function findTarget(start: IVector3, isTarget: (point: IVector3, tile: ITile) => boolean, maxTilesChecked: number = defaultMaxTilesChecked): IVector3 | undefined {
	return TileHelpers.findMatchingTile(start, isTarget, maxTilesChecked, (point, tile) => {
		const tileType = TileHelpers.getType(tile);
		const terrainDescription = Terrains[tileType];
		if (terrainDescription && terrainDescription.water) {
			return false;
		}

		return true;
	});
}

let cachedObjects: { [index: string]: any | undefined };

export function resetCachedObjects() {
	cachedObjects = {};
}

export function findObjects<T extends IVector3>(id: string, allObjects: T[], isTarget: (object: T) => boolean): T[] {
	const cachedResults = cachedObjects[id];
	if (cachedResults) {
		return cachedResults;
	}

	const result = allObjects.filter(o => o !== undefined && o.z === localPlayer.z && isTarget(o)).sort((a, b) => Vector2.squaredDistance(localPlayer, a) > Vector2.squaredDistance(localPlayer, b) ? 1 : -1);

	cachedObjects[id] = result;

	return result;
}
export function findObject<T extends IVector3>(id: string, object: T[], isTarget: (object: T) => boolean): T | undefined {
	const objects = findObjects(id, object, isTarget);
	return objects.length > 0 ? objects[0] : undefined;
}

export function findDoodad(id: string, isTarget: (doodad: IDoodad) => boolean): IDoodad | undefined {
	return findObject(`Doodad:${id}`, game.doodads as IDoodad[], isTarget);
}

export function findDoodads(id: string, isTarget: (doodad: IDoodad) => boolean): IDoodad[] {
	return findObjects(`Doodad:${id}`, game.doodads as IDoodad[], isTarget);
}

export function findCreature(id: string, isTarget: (creature: ICreature) => boolean): ICreature | undefined {
	return findObject(`Creature:${id}`, game.creatures as ICreature[], isTarget);
}

export function findCorpse(id: string, isTarget: (corpse: ICorpse) => boolean): ICorpse | undefined {
	return findObject(`Corpse:${id}`, game.corpses as ICorpse[], isTarget);
}

export async function findAndMoveToTarget(isTarget: (point: IVector3, tile: ITile) => boolean, moveInto: boolean = false, maxTilesChecked: number = defaultMaxTilesChecked, start: IVector3 = localPlayer): Promise<MoveResult> {
	return moveToTargetWithRetries((ignoredTiles: ITile[]) => findTarget(start, (point, tile) => ignoredTiles.indexOf(tile) === -1 && isTarget(point, tile), maxTilesChecked), moveInto);
}

export async function findAndMoveToDoodad(id: string, isTarget: (doodad: IDoodad) => boolean, moveInto: boolean = false): Promise<MoveResult> {
	return findAndMoveToObject(`Doodad:${id}`, game.doodads as IDoodad[], isTarget, moveInto);
}

export async function findAndMoveToCreature(id: string, isTarget: (creature: ICreature) => boolean, moveInto: boolean = false): Promise<MoveResult> {
	return findAndMoveToObject(`Creature:${id}`, (game.creatures as ICreature[]).filter(c => c !== undefined && (c.ai & AiType.Hidden) === 0), isTarget, moveInto);
}

export async function findAndMoveToCorpse(id: string, isTarget: (corpse: ICorpse) => boolean, moveInto: boolean = false): Promise<MoveResult> {
	return findAndMoveToObject(`Corpse:${id}`, game.corpses as ICorpse[], isTarget, moveInto);
}

export async function findAndMoveToObject<T extends IVector3>(id: string, allObjects: T[], isTarget: (object: T) => boolean, moveInto: boolean) {
	const objects = findObjects(id, allObjects, isTarget);
	if (objects.length > 0) {
		for (let i = 0; i < Math.min(objects.length, 2); i++) {
			const result = await moveToTarget(objects[i], moveInto);
			if (result === MoveResult.Moving || result === MoveResult.Complete) {
				return result;
			}
		}

		return MoveResult.NoPath;
	}

	return MoveResult.NoTarget;
}

export async function moveToTargetWithRetries(getTarget: (ignoredTiles: ITile[]) => IVector3 | undefined, moveInto: boolean = false, maxRetries: number = 5): Promise<MoveResult> {
	const ignoredTiles: ITile[] = [];

	let moveResult = MoveResult.NoPath;
	while (moveResult === MoveResult.NoPath && maxRetries > 0) {
		maxRetries--;

		const target = getTarget(ignoredTiles);
		if (target) {
			moveResult = await moveToTarget(target, moveInto);
			if (moveResult === MoveResult.NoPath) {
				log("Cannot path to target, ignoring", target);
				ignoredTiles.push(game.getTileFromPoint(target));

			} else {
				return moveResult;
			}

		} else {
			return MoveResult.NoTarget;
		}
	}

	return MoveResult.NoTarget;
}

let cachedPaths: { [index: string]: IVector2[] | undefined };
const movementOverlays: ITile[] = [];

export function resetMovementOverlays() {
	for (const tile of movementOverlays) {
		delete tile.overlay;
	}

	movementOverlays.length = 0;
}

export function updateOverlay(path: IVector2[]) {
	resetMovementOverlays();
	
	for (let i = 1; i < path.length; i++) {
		const lastPos = path[i - 1];
		const pos = path[i];
		const nextPos: IVector2 | undefined = path[i + 1];
	
		const tile = game.getTile(pos.x, pos.y, localPlayer.z);
	
		tile.overlay = PathOverlayFootPrints(i, path.length, pos, lastPos, nextPos);
		if (tile.overlay) {
			movementOverlays.push(tile);
		}
	}	
}

export function resetCachedPaths() {
	cachedPaths = {};
}

export async function getMovementPath(target: IVector3, moveInto: boolean = false): Promise<IMovementPath> {
	if (localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z) {
		return {
			difficulty: 1
		};
	}

	let movementPath: IVector2[] | undefined;

	const pathId = `${target.x},${target.y},${target.z}`;
	if (pathId in cachedPaths) {
		movementPath = cachedPaths[pathId];

	} else {
		const navigation = getNavigation();

		const ends = navigation.getValidPoint(target, moveInto).sort((a, b) => Vector2.squaredDistance(localPlayer, a) > Vector2.squaredDistance(localPlayer, b) ? 1 : -1);
		if (ends.length === 0) {
			return {
				difficulty: missionImpossible
			};
		}

		for (const end of ends) {
			movementPath = await navigation.findPath(end, localPlayer);
			if (movementPath) {
				break;
			}
		}

		cachedPaths[pathId] = movementPath;
	}

	if (movementPath) {
		// log("getMovementPath", movementPath.length, Vector2.squaredDistance(localPlayer, target));

		return {
			difficulty: Vector2.squaredDistance(localPlayer, target),
			path: movementPath
		};
	}

	return {
		difficulty: missionImpossible
	};
}

export async function moveToTarget(target: IVector3, moveInto: boolean = false): Promise<MoveResult> {
	if (localPlayer.x !== target.x || localPlayer.y !== target.y || localPlayer.z !== target.z) {
		const movementPath = await getMovementPath(target, moveInto);
		if (!movementPath.path) {
			return MoveResult.NoPath;
		}

		const pathLength = movementPath.path.length;

		const end = movementPath.path[pathLength - 1];
		if (!end) {
			log("Broken path!", pathLength, target.x, target.x, target.y, localPlayer.x, localPlayer.y, localPlayer.z);
			return MoveResult.NoPath;
		}

		const atEnd = localPlayer.x === end.x && localPlayer.y === end.y;
		if (!atEnd) {
			if (!localPlayer.hasWalkPath()) {
				updateOverlay(movementPath.path);
				
				localPlayer.walkAlongPath(movementPath.path);
			}

			return MoveResult.Moving;
		}
	}

	const direction = getDirectionFromMovement(target.x - localPlayer.x, target.y - localPlayer.y);
	if (direction !== localPlayer.facingDirection) {
		await executeAction(ActionType.UpdateDirection, {
			direction: direction,
			bypass: true
		});
	}
	
	if (moveInto) {
		log(`Completed movement into ${target.x},${target.y},${target.z}`);
		
		await executeAction(ActionType.Move, {
			direction: direction
		});
		
		return MoveResult.Complete;
	}

	return MoveResult.Complete;
}

export function isGoodBuildTile(base: IBase, point: IVector3, tile: ITile): boolean {
	return isOpenArea(base, point, tile) && isNearBase(base, point, tile);
}

export function isOpenArea(base: IBase, point: IVector3, tile: ITile): boolean {
	if (!isOpenTile(point, tile, false, false) || tile.corpses !== undefined) {
		return false;
	}

	for (let x = -1; x <= 1; x++) {
		for (let y = -1; y <= 1; y++) {
			const nearbyPoint: IVector3 = {
				x: point.x + x,
				y: point.y + y,
				z: point.z
			};

			const nearbyTile = game.getTileFromPoint(nearbyPoint);
			if (nearbyTile.doodad) {
				return false;
			}

			const container = tile as IContainer;
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

export function getBaseDoodads(base: IBase): IDoodad[] {
	let doodads: IDoodad[] = [];

	for (const key of Object.keys(base)) {
		const baseDoodadOrDoodads: IDoodad | IDoodad[] = (base as any)[key];
		if (Array.isArray(baseDoodadOrDoodads)) {
			doodads = doodads.concat(baseDoodadOrDoodads);

		} else {
			doodads.push(baseDoodadOrDoodads);
		}
	}

	return doodads;
}

export function hasBase(base: IBase): boolean {
	return Object.keys(base).findIndex(key => {
		const baseDoodadOrDoodads: IDoodad | IDoodad[] = (base as any)[key];
		if (Array.isArray(baseDoodadOrDoodads)) {
			return baseDoodadOrDoodads.length > 0;
		}

		return baseDoodadOrDoodads !== undefined;
	}) !== -1;
}

export function isNearBase(base: IBase, point: IVector3, tile: ITile): boolean {
	if (!hasBase(base)) {
		return true;
	}

	for (let x = -nearBaseDistance; x <= nearBaseDistance; x++) {
		for (let y = -nearBaseDistance; y <= nearBaseDistance; y++) {
			const nearbyPoint: IVector3 = {
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

export function isOpenTile(point: IVector3, tile: ITile, ignoreLocalPlayer: boolean = true, allowWater: boolean = true): boolean {
	if (tile.creature !== undefined) {
		return false;
	}

	if (tile.doodad !== undefined) {
		return false;
	}

	const terrainType = TileHelpers.getType(tile);
	const terrainInfo = Terrains[terrainType];
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

export function getItemInInventory(inventory: IInventoryItems, itemTypeSearch: ItemType, excludeUsefulItems: boolean = true): IItem | undefined {
	return getItemInContainer(inventory, localPlayer.inventory, itemTypeSearch, excludeUsefulItems);
}

export function getItemInContainer(inventory: IInventoryItems, container: IContainer, itemTypeSearch: ItemType, excludeUsefulItems: boolean = true): IItem | undefined {
	const orderedItems = itemManager.getOrderedContainerItems(container);
	for (const item of orderedItems) {
		if (excludeUsefulItems && isInventoryItem(inventory, item)) {
			continue;
		}

		if (item.type === itemTypeSearch) {
			return item;
		}

		const description = Items[item.type];
		if (description && description.weightCapacity !== undefined) {
			const item2 = getItemInContainer(inventory, item as IContainer, itemTypeSearch, excludeUsefulItems);
			if (item2) {
				return item2;
			}
		}
	}

	return undefined;
}

export function isInventoryItem(inventory: IInventoryItems, item: IItem) {
	return Object.keys(inventory).findIndex(key => {
		const itemOrItems: IItem | IItem[] = (inventory as any)[key];
		if (Array.isArray(itemOrItems)) {
			return itemOrItems.indexOf(item) !== -1;
		}

		return itemOrItems === item;
	}) !== -1;
}

export function isBaseDoodad(base: IBase, doodad: IDoodad) {
	return Object.keys(base).findIndex(key => {
		const baseDoodadOrDoodads: IDoodad | IDoodad[] = (base as any)[key];
		if (Array.isArray(baseDoodadOrDoodads)) {
			return baseDoodadOrDoodads.indexOf(doodad) !== -1;
		}

		return baseDoodadOrDoodads === doodad;
	}) !== -1;
}

export function getBasePosition(base: IBase): IVector3 {
	return base.campfire || base.waterStill || base.kiln || localPlayer;
}

export function getSeeds(): IItem[] {
	return itemManager.getItemsInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Seed, true).filter(seed => seed.minDur !== undefined && seed.minDur > 0);
}

const recipes: IRecipe[] = [];

export function resetTargetRecipes() {
	recipes.length = 0;
}

export function addTargetRecipe(recipe: IRecipe) {
	if (recipes.indexOf(recipe) === -1) {
		recipes.push(recipe);

		log("addTargetRecipe", recipe);
	}
}

export function processRecipe(inventory: IInventoryItems, recipe: IRecipe, trackItems: boolean): ItemRecipeRequirementChecker {
	const checker = new ItemRecipeRequirementChecker(localPlayer, recipe, trackItems);

	// don't process using reserved items
	// todo: use protectedCraftingItems and quickslot important things
	const items = localPlayer.inventory.containedItems.filter(i => !isInventoryItem(inventory, i));
	const container: IContainer = {
		weightCapacity: localPlayer.inventory.weightCapacity,
		containedItems: items,
		itemOrders: items.map(i => i.id)
	};
	checker.processContainer(container, true);
	// checker.processAdjacent(true);

	return checker;
}

export function isUsedByTargetRecipe(inventory: IInventoryItems, item: IItem): boolean {
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

export function getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): DoodadType[] {
	const doodadTypes: DoodadType[] = [];

	if (doodadManager.isDoodadTypeGroup(doodadTypeOrGroup)) {
		for (const dt of Enums.values(DoodadType)) {
			const doodadDescription = Doodads[dt];
			if (!doodadDescription) {
				continue;
			}

			if (doodadDescription.group === doodadTypeOrGroup) {
				doodadTypes.push(dt);
			}

			const lit = doodadDescription.lit;
			if (lit !== undefined) {
				const litDoodadDescription = Doodads[lit];
				if (litDoodadDescription && litDoodadDescription.group === doodadTypeOrGroup) {
					doodadTypes.push(dt);
				}
			}

			const revert = doodadDescription.revert;
			if (revert !== undefined) {
				const revertDoodadDescription = Doodads[revert];
				if (revertDoodadDescription && revertDoodadDescription.group === doodadTypeOrGroup) {
					doodadTypes.push(dt);
				}
			}
		}

	} else {
		doodadTypes.push(doodadTypeOrGroup);
	}

	return doodadTypes;
}

export function getUnusedItems(inventory: IInventoryItems) {
	return localPlayer.inventory.containedItems.filter(item => {
		if (item.isEquipped() || isInventoryItem(inventory, item) || isUsedByTargetRecipe(inventory, item)) {
			return false;
		}

		const description = item.description();
		if (description && description.use && (description.use.indexOf(ActionType.GatherWater) !== -1 || description.use.indexOf(ActionType.DrinkItem) !== -1)) {
			return false;
		}

		return true;
	}).sort((a, b) => a.weight < b.weight ? 1 : -1);
}

export function getNearbyCreature(point: IVector3): ICreature | undefined {
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

const pendingActions: {
	[index: number]: {
		rejectorTimeoutId: number;
		resolve(success: boolean): void;
	};
} = {};

export function waitForAction(actionType: ActionType) {
	return new Promise<boolean>(resolve => {
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

export function postExecuteAction(actionType: ActionType) {
	const pendingAction = pendingActions[actionType];
	if (pendingAction) {
		clearTimeout(pendingAction.rejectorTimeoutId);
		delete pendingActions[actionType];
		pendingAction.resolve(true);
	}
}

export async function executeAction(actionType: ActionType, executeArgument?: ExecuteArgument) {
	let waiter: Promise<boolean> | undefined;

	if (localPlayer.hasDelay()) {
		await new Promise(resolve => {
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
		// the action won't be executed immediately, we need to setup a callback
		waiter = waitForAction(actionType);
	}

	actionManager.execute(localPlayer, actionType, executeArgument);

	if (waiter) {
		await waiter;
	}
}
