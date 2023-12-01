/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "../ITars", "./ContextState", "./IContext"], function (require, exports, ITars_1, ContextState_1, IContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Context {
        constructor(tars, base, inventory, utilities, state = new ContextState_1.default(), calculatingDifficulty = false, initialState) {
            this.tars = tars;
            this.base = base;
            this.inventory = inventory;
            this.utilities = utilities;
            this.state = state;
            this.calculatingDifficulty = calculatingDifficulty;
            this.initialState = initialState;
        }
        get human() {
            return this.tars.human;
        }
        get island() {
            return this.tars.human.island;
        }
        get log() {
            return this.utilities.logger.log;
        }
        get options() {
            return this.tars.saveData.options;
        }
        toString() {
            return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined}`;
        }
        clone(calculatingDifficulty = false, increaseDepth = false, cloneInitialState) {
            return new Context(this.tars, this.base, this.inventory, this.utilities, this.state.clone(increaseDepth), calculatingDifficulty, cloneInitialState ? this.initialState?.clone(increaseDepth) : this.initialState);
        }
        merge(state) {
            this.state.merge(state);
            if (this.changes) {
                this.changes.merge(state);
            }
        }
        watchForChanges() {
            if (this.changes) {
                throw new Error("Already watching for changes");
            }
            this.changes = new ContextState_1.default(this.state.depth);
            return this.changes;
        }
        unwatch() {
            this.changes = undefined;
        }
        isReservedItem(item) {
            if (this.state.reservedItems?.has(item)) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isSoftReservedItem(item) {
            if (this.state.reservedItems?.get(item) === ITars_1.ReserveType.Soft) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isHardReservedItem(item) {
            if (this.state.reservedItems?.get(item) === ITars_1.ReserveType.Hard) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isReservedItemType(itemType, objectiveHashCode) {
            const objectiveHashCodes = this.state.reservedItemTypesPerObjectiveHashCode?.get(itemType);
            return objectiveHashCodes !== undefined && (!objectiveHashCode || objectiveHashCodes?.has(objectiveHashCode));
        }
        hasData(type) {
            return this.state.has(type);
        }
        getData(type) {
            return this.state.get(type);
        }
        getDataOrDefault(type, defaultValue) {
            return this.getData(type) ?? defaultValue;
        }
        setData(type, value) {
            this.state.set(type, value);
            if (this.changes) {
                this.changes.set(type, value, true);
            }
        }
        addSoftReservedItems(...items) {
            this.state.reservedItems ??= new Map();
            for (const item of items) {
                if (this.state.reservedItems.get(item) === ITars_1.ReserveType.Hard) {
                    if (this.changes && (!this.changes.reservedItems || this.changes.reservedItems.get(item) !== ITars_1.ReserveType.Hard)) {
                        this.changes.reservedItems ??= new Map();
                        this.changes.reservedItems.set(item, ITars_1.ReserveType.Soft);
                        this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                    }
                    continue;
                }
                this.state.reservedItems.set(item, ITars_1.ReserveType.Soft);
                this.state.addReservedItemTypeForObjectiveHashCode(item.type);
                if (this.changes) {
                    this.changes.reservedItems ??= new Map();
                    this.changes.reservedItems.set(item, ITars_1.ReserveType.Soft);
                    this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                }
            }
        }
        addSoftReservedItemsForObjectiveHashCode(objectiveHashCode, ...items) {
            this.state.reservedItems ??= new Map();
            for (const item of items) {
                if (this.state.reservedItems.get(item) === ITars_1.ReserveType.Hard) {
                    if (this.changes && (!this.changes.reservedItems || this.changes.reservedItems.get(item) !== ITars_1.ReserveType.Hard)) {
                        this.changes.reservedItems ??= new Map();
                        this.changes.reservedItems.set(item, ITars_1.ReserveType.Soft);
                        this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                    }
                    continue;
                }
                this.state.reservedItems.set(item, ITars_1.ReserveType.Soft);
                this.state.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                if (this.changes) {
                    this.changes.reservedItems ??= new Map();
                    this.changes.reservedItems.set(item, ITars_1.ReserveType.Soft);
                    this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                }
            }
        }
        addHardReservedItems(...items) {
            this.state.reservedItems ??= new Map();
            if (this.changes) {
                this.changes.reservedItems ??= new Map();
            }
            for (const item of items) {
                this.state.reservedItems.set(item, ITars_1.ReserveType.Hard);
                this.state.addReservedItemTypeForObjectiveHashCode(item.type);
                if (this.changes) {
                    this.changes.reservedItems.set(item, ITars_1.ReserveType.Hard);
                    this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                }
            }
        }
        addHardReservedItemsForObjectiveHashCode(objectiveHashCode, ...items) {
            this.state.reservedItems ??= new Map();
            if (this.changes) {
                this.changes.reservedItems ??= new Map();
            }
            for (const item of items) {
                this.state.reservedItems.set(item, ITars_1.ReserveType.Hard);
                this.state.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                if (this.changes) {
                    this.changes.reservedItems.set(item, ITars_1.ReserveType.Hard);
                    this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                }
            }
        }
        addProvidedItems(itemTypes) {
            this.state.providedItems ??= new Map();
            if (this.changes) {
                this.changes.providedItems ??= new Map();
            }
            for (const itemType of itemTypes) {
                this.state.providedItems.set(itemType, (this.state.providedItems.get(itemType) ?? 0) + 1);
                if (this.changes) {
                    this.changes.providedItems.set(itemType, (this.changes.providedItems.get(itemType) ?? 0) + 1);
                }
            }
        }
        tryUseProvidedItems(itemType) {
            const available = this.state.providedItems?.get(itemType) ?? 0;
            if (available > 0) {
                const newValue = available - 1;
                this.state.providedItems.set(itemType, newValue);
                if (newValue === 0 && this.state.providedItems.delete(itemType) && this.state.providedItems.size === 0) {
                    this.state.providedItems = undefined;
                }
                if (this.changes) {
                    this.changes.providedItems ??= new Map();
                    const newValue = (this.changes.providedItems.get(itemType) ?? 0) - 1;
                    this.changes.providedItems.set(itemType, newValue);
                }
                return true;
            }
            return false;
        }
        setInitialState(state = this.state.clone(false)) {
            this.initialState = state;
        }
        setInitialStateData(type, value) {
            if (!this.initialState) {
                if (value === undefined) {
                    return;
                }
                this.initialState = new ContextState_1.default();
            }
            this.initialState.set(type, value);
        }
        reset() {
            this.changes = undefined;
            if (this.initialState) {
                this.state = this.initialState.clone(false);
            }
            else {
                this.state.reset();
            }
            this.resetPosition();
        }
        resetPosition() {
            this.setData(IContext_1.ContextDataType.Tile, this.human.tile);
        }
        getHashCode() {
            return this.state.getHashCode();
        }
        getFilteredHashCode(filter) {
            return this.state.getFilteredHashCode(filter);
        }
        markShouldIncludeHashCode() {
            this.state.includeHashCode = true;
            if (this.changes) {
                this.changes.includeHashCode = true;
            }
        }
        isPlausible(difficulty, requireMinimumAcceptedDifficulty = false) {
            if (requireMinimumAcceptedDifficulty && this.state.minimumAcceptedDifficulty === undefined) {
                return true;
            }
            return this.state.minimumAcceptedDifficulty === undefined || this.state.minimumAcceptedDifficulty >= difficulty;
        }
        getTile() {
            const tile = this.getData(IContext_1.ContextDataType.Tile);
            if (tile && (tile.x === undefined || tile.y === undefined || tile.z === undefined)) {
                console.error(`[TARS] getTile - Invalid value ${tile}`);
            }
            return tile ?? this.human.tile;
        }
    }
    exports.default = Context;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRleHQvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFlSCxNQUFxQixPQUFPO1FBSTNCLFlBQ2lCLElBQVUsRUFDVixJQUFXLEVBQ1gsU0FBMEIsRUFDMUIsU0FBcUIsRUFDOUIsUUFBUSxJQUFJLHNCQUFZLEVBQUUsRUFDakIsd0JBQWlDLEtBQUssRUFDOUMsWUFBMkI7WUFObkIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLFNBQUksR0FBSixJQUFJLENBQU87WUFDWCxjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUMxQixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQzlCLFVBQUssR0FBTCxLQUFLLENBQXFCO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBaUI7WUFDOUMsaUJBQVksR0FBWixZQUFZLENBQWU7UUFDcEMsQ0FBQztRQUVELElBQVcsS0FBSztZQUNmLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQVcsTUFBTTtZQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLG9CQUFvQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcs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