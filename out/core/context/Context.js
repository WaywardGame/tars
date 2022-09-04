define(["require", "exports", "utilities/math/Vector3", "./ContextState", "./IContext"], function (require, exports, Vector3_1, ContextState_1, IContext_1) {
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
        clone(calculatingDifficulty = false, increaseDepth = false) {
            return new Context(this.tars, this.base, this.inventory, this.utilities, this.state.clone(increaseDepth), calculatingDifficulty, this.initialState?.clone(increaseDepth));
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
            if (this.state.softReservedItems.has(item) || this.state.hardReservedItems.has(item)) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isSoftReservedItem(item) {
            if (this.state.softReservedItems.has(item)) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isHardReservedItem(item) {
            if (this.state.hardReservedItems.has(item)) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isReservedItemType(itemType, objectiveHashCode) {
            return this.state.reservedItemTypesPerObjectiveHashCode.has(itemType) && (!objectiveHashCode || this.state.reservedItemTypesPerObjectiveHashCode.get(itemType)?.has(objectiveHashCode) === true);
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
                this.changes.set(type, value);
            }
        }
        addSoftReservedItems(...items) {
            for (const item of items) {
                this.state.softReservedItems.add(item);
                this.state.addReservedItemTypeForObjectiveHashCode(item.type);
                if (this.changes) {
                    this.changes.softReservedItems.add(item);
                    this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                }
            }
        }
        addSoftReservedItemsForObjectiveHashCode(objectiveHashCode, ...items) {
            for (const item of items) {
                this.state.softReservedItems.add(item);
                this.state.addReservedItemTypeForObjectiveHashCode(item.type);
                this.state.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                if (this.changes) {
                    this.changes.softReservedItems.add(item);
                    this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                    this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                }
            }
        }
        addHardReservedItems(...items) {
            for (const item of items) {
                this.state.hardReservedItems.add(item);
                this.state.addReservedItemTypeForObjectiveHashCode(item.type);
                if (this.changes) {
                    this.changes.hardReservedItems.add(item);
                    this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                }
            }
        }
        addHardReservedItemsForObjectiveHashCode(objectiveHashCode, ...items) {
            for (const item of items) {
                this.state.hardReservedItems.add(item);
                this.state.addReservedItemTypeForObjectiveHashCode(item.type);
                this.state.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                if (this.changes) {
                    this.changes.hardReservedItems.add(item);
                    this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
                    this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
                }
            }
        }
        addProvidedItems(itemTypes) {
            for (const itemType of itemTypes) {
                this.state.providedItems.set(itemType, (this.state.providedItems.get(itemType) ?? 0) + 1);
                if (this.changes) {
                    this.changes.providedItems.set(itemType, (this.changes.providedItems.get(itemType) ?? 0) + 1);
                }
            }
        }
        tryUseProvidedItems(itemType) {
            const available = this.state.providedItems.get(itemType) ?? 0;
            if (available > 0) {
                this.state.providedItems.set(itemType, available - 1);
                if (this.changes) {
                    this.changes.providedItems.set(itemType, (this.changes.providedItems.get(itemType) ?? 0) - 1);
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
            this.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(this.human));
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
        getPosition() {
            const position = this.getData(IContext_1.ContextDataType.Position);
            if (position && (position.x === undefined || position.y === undefined || position.z === undefined)) {
                console.error(`[TARS] getPosition - Invalid value ${position}`);
            }
            return position || this.human.getPoint();
        }
    }
    exports.default = Context;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRleHQvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixPQUFPO1FBSTNCLFlBQ2lCLElBQVUsRUFDVixJQUFXLEVBQ1gsU0FBMEIsRUFDMUIsU0FBcUIsRUFDOUIsUUFBUSxJQUFJLHNCQUFZLEVBQUUsRUFDakIsd0JBQWlDLEtBQUssRUFDOUMsWUFBMkI7WUFObkIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLFNBQUksR0FBSixJQUFJLENBQU87WUFDWCxjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUMxQixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQzlCLFVBQUssR0FBTCxLQUFLLENBQXFCO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBaUI7WUFDOUMsaUJBQVksR0FBWixZQUFZLENBQWU7UUFDcEMsQ0FBQztRQUVELElBQVcsS0FBSztZQUNmLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQVcsTUFBTTtZQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLG9CQUFvQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FB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