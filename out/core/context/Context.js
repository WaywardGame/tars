define(["require", "exports", "utilities/math/Vector3", "../ITars", "./ContextState", "./IContext"], function (require, exports, Vector3_1, ITars_1, ContextState_1, IContext_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRleHQvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixPQUFPO1FBSTNCLFlBQ2lCLElBQVUsRUFDVixJQUFXLEVBQ1gsU0FBMEIsRUFDMUIsU0FBcUIsRUFDOUIsUUFBUSxJQUFJLHNCQUFZLEVBQUUsRUFDakIsd0JBQWlDLEtBQUssRUFDOUMsWUFBMkI7WUFObkIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLFNBQUksR0FBSixJQUFJLENBQU87WUFDWCxjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUMxQixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQzlCLFVBQUssR0FBTCxLQUFLLENBQXFCO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBaUI7WUFDOUMsaUJBQVksR0FBWixZQUFZLENBQWU7UUFDcEMsQ0FBQztRQUVELElBQVcsS0FBSztZQUNmLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQVcsTUFBTTtZQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLG9CQUFvQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzFNLENBQUM7UUFFTSxLQUFLLENBQUMsd0JBQWlDLEtBQUssRUFBRSxnQkFBeUIsS0FBSyxFQUFFLGlCQUEyQjtZQUMvRyxPQUFPLElBQUksT0FBTyxDQUNqQixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLFNBQVMsRUFDZCxJQUFJLENBQUMsU0FBUyxFQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUMvQixxQkFBcUIsRUFDckIsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVNLEtBQUssQ0FBQyxLQUFtQjtZQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztRQUVNLGVBQWU7WUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7YUFDaEQ7WUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRU0sT0FBTztZQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFLTSxjQUFjLENBQUMsSUFBVTtZQUMvQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFLTSxrQkFBa0IsQ0FBQyxJQUFVO1lBQ25DLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM3RCxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztnQkFDakMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUtNLGtCQUFrQixDQUFDLElBQVU7WUFDbkMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzdELElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTU0sa0JBQWtCLENBQUMsUUFBa0IsRUFBRSxpQkFBMEI7WUFDdkUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRixPQUFPLGtCQUFrQixLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLElBQUksa0JBQWtCLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUMvRyxDQUFDO1FBRU0sT0FBTyxDQUFVLElBQVk7WUFDbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRU0sZ0JBQWdCLENBQVUsSUFBWSxFQUFFLFlBQWU7WUFDN0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQztRQUMzQyxDQUFDO1FBRU0sT0FBTyxDQUFVLElBQVksRUFBRSxLQUFvQjtZQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQztRQUVNLG9CQUFvQixDQUFDLEdBQUcsS0FBYTtZQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRXZDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxtQkFBVyxDQUFDLElBQUksRUFBRTtvQkFDNUQsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDL0csSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDaEU7b0JBRUQsU0FBUztpQkFDVDtnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU5RCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hFO2FBQ0Q7UUFDRixDQUFDO1FBRU0sd0NBQXdDLENBQUMsaUJBQXlCLEVBQUUsR0FBRyxLQUFhO1lBQzFGLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7WUFFdkMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO29CQUc1RCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxtQkFBVyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUMvRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7cUJBQzFFO29CQUVELFNBQVM7aUJBQ1Q7Z0JBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUV4RSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztpQkFDMUU7YUFDRDtRQUNGLENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxHQUFHLEtBQWE7WUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN2QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7YUFDekM7WUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFjLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFOUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsdUNBQXVDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNoRTthQUNEO1FBQ0YsQ0FBQztRQUVNLHdDQUF3QyxDQUFDLGlCQUF5QixFQUFFLEdBQUcsS0FBYTtZQUMxRixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUN6QztZQUVELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBRXhFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFjLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2lCQUMxRTthQUNEO1FBQ0YsQ0FBQztRQUVNLGdCQUFnQixDQUFDLFNBQXFCO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO2FBQ3pDO1lBRUQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRTFGLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDaEc7YUFDRDtRQUNGLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxRQUFrQjtZQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9ELElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtnQkFDbEIsTUFBTSxRQUFRLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxRQUFRLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO29CQUN6RyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7aUJBQ3JDO2dCQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFFekMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUduRDtnQkFFRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sZUFBZSxDQUFDLFFBQXNCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUNuRSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMzQixDQUFDO1FBRU0sbUJBQW1CLENBQVUsSUFBWSxFQUFFLEtBQW9CO1lBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN2QixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHNCQUFZLEVBQUUsQ0FBQzthQUN2QztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1lBRXpCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUU1QztpQkFBTTtnQkFDTixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ25CO1lBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxhQUFhO1lBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU0sbUJBQW1CLENBQUMsTUFBeUI7WUFDbkQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFNTSx5QkFBeUI7WUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBRWxDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQztRQU1NLFdBQVcsQ0FBQyxVQUFrQixFQUFFLG1DQUE0QyxLQUFLO1lBQ3ZGLElBQUksZ0NBQWdDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsS0FBSyxTQUFTLEVBQUU7Z0JBQzNGLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLElBQUksVUFBVSxDQUFDO1FBQ2pILENBQUM7UUFLTSxXQUFXO1lBTWpCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4RCxJQUFJLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLEVBQUU7Z0JBQ25HLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDaEU7WUFFRCxPQUFPLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFDLENBQUM7S0FDRDtJQTlVRCwwQkE4VUMifQ==