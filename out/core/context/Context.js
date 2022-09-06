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
                this.changes.set(type, value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRleHQvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixPQUFPO1FBSTNCLFlBQ2lCLElBQVUsRUFDVixJQUFXLEVBQ1gsU0FBMEIsRUFDMUIsU0FBcUIsRUFDOUIsUUFBUSxJQUFJLHNCQUFZLEVBQUUsRUFDakIsd0JBQWlDLEtBQUssRUFDOUMsWUFBMkI7WUFObkIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLFNBQUksR0FBSixJQUFJLENBQU87WUFDWCxjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUMxQixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQzlCLFVBQUssR0FBTCxLQUFLLENBQXFCO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBaUI7WUFDOUMsaUJBQVksR0FBWixZQUFZLENBQWU7UUFDcEMsQ0FBQztRQUVELElBQVcsS0FBSztZQUNmLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQVcsTUFBTTtZQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLG9CQUFvQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzFNLENBQUM7UUFFTSxLQUFLLENBQUMsd0JBQWlDLEtBQUssRUFBRSxnQkFBeUIsS0FBSyxFQUFFLGlCQUEyQjtZQUMvRyxPQUFPLElBQUksT0FBTyxDQUNqQixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLFNBQVMsRUFDZCxJQUFJLENBQUMsU0FBUyxFQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUMvQixxQkFBcUIsRUFDckIsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVNLEtBQUssQ0FBQyxLQUFtQjtZQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztRQUVNLGVBQWU7WUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7YUFDaEQ7WUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRU0sT0FBTztZQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFLTSxjQUFjLENBQUMsSUFBVTtZQUMvQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFLTSxrQkFBa0IsQ0FBQyxJQUFVO1lBQ25DLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM3RCxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztnQkFDakMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUtNLGtCQUFrQixDQUFDLElBQVU7WUFDbkMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzdELElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTU0sa0JBQWtCLENBQUMsUUFBa0IsRUFBRSxpQkFBMEI7WUFDdkUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRixPQUFPLGtCQUFrQixLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLElBQUksa0JBQWtCLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUMvRyxDQUFDO1FBRU0sT0FBTyxDQUFVLElBQVk7WUFDbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRU0sZ0JBQWdCLENBQVUsSUFBWSxFQUFFLFlBQWU7WUFDN0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQztRQUMzQyxDQUFDO1FBRU0sT0FBTyxDQUFVLElBQVksRUFBRSxLQUFvQjtZQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDOUI7UUFDRixDQUFDO1FBRU0sb0JBQW9CLENBQUMsR0FBRyxLQUFhO1lBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7WUFFdkMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO29CQUM1RCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxtQkFBVyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUMvRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsdUNBQXVDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNoRTtvQkFFRCxTQUFTO2lCQUNUO2dCQUVELElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTlELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDaEU7YUFDRDtRQUNGLENBQUM7UUFFTSx3Q0FBd0MsQ0FBQyxpQkFBeUIsRUFBRSxHQUFHLEtBQWE7WUFDMUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUV2QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJLEVBQUU7b0JBRzVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQy9HLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7d0JBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztxQkFDMUU7b0JBRUQsU0FBUztpQkFDVDtnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBRXhFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2lCQUMxRTthQUNEO1FBQ0YsQ0FBQztRQUVNLG9CQUFvQixDQUFDLEdBQUcsS0FBYTtZQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUN6QztZQUVELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU5RCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hFO2FBQ0Q7UUFDRixDQUFDO1FBRU0sd0NBQXdDLENBQUMsaUJBQXlCLEVBQUUsR0FBRyxLQUFhO1lBQzFGLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO2FBQ3pDO1lBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFFeEUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7aUJBQzFFO2FBQ0Q7UUFDRixDQUFDO1FBRU0sZ0JBQWdCLENBQUMsU0FBcUI7WUFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN2QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7YUFDekM7WUFFRCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFMUYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNoRzthQUNEO1FBQ0YsQ0FBQztRQUVNLG1CQUFtQixDQUFDLFFBQWtCO1lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0QsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQixNQUFNLFFBQVEsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLFFBQVEsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7b0JBQ3pHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztpQkFDckM7Z0JBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUV6QyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3JFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBR25EO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxlQUFlLENBQUMsUUFBc0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7UUFFTSxtQkFBbUIsQ0FBVSxJQUFZLEVBQUUsS0FBb0I7WUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksc0JBQVksRUFBRSxDQUFDO2FBQ3ZDO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFFekIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBRTVDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDbkI7WUFFRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVNLGFBQWE7WUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxNQUF5QjtZQUNuRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQU1NLHlCQUF5QjtZQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7YUFDcEM7UUFDRixDQUFDO1FBTU0sV0FBVyxDQUFDLFVBQWtCLEVBQUUsbUNBQTRDLEtBQUs7WUFDdkYsSUFBSSxnQ0FBZ0MsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixLQUFLLFNBQVMsRUFBRTtnQkFDM0YsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsSUFBSSxVQUFVLENBQUM7UUFDakgsQ0FBQztRQUtNLFdBQVc7WUFNakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsRUFBRTtnQkFDbkcsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNoRTtZQUVELE9BQU8sUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUMsQ0FBQztLQUNEO0lBOVVELDBCQThVQyJ9