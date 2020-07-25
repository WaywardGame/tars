define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextState = exports.ContextDataType = void 0;
    var ContextDataType;
    (function (ContextDataType) {
        ContextDataType[ContextDataType["LastKnownPosition"] = 0] = "LastKnownPosition";
        ContextDataType[ContextDataType["LastAcquiredItem"] = 1] = "LastAcquiredItem";
        ContextDataType[ContextDataType["LastBuiltDoodad"] = 2] = "LastBuiltDoodad";
        ContextDataType[ContextDataType["Item1"] = 3] = "Item1";
        ContextDataType[ContextDataType["Item2"] = 4] = "Item2";
        ContextDataType[ContextDataType["AllowOrganizingReservedItemsIntoIntermediateChest"] = 5] = "AllowOrganizingReservedItemsIntoIntermediateChest";
        ContextDataType[ContextDataType["NextActionAllowsIntermediateChest"] = 6] = "NextActionAllowsIntermediateChest";
        ContextDataType[ContextDataType["CanCraftFromIntermediateChest"] = 7] = "CanCraftFromIntermediateChest";
    })(ContextDataType = exports.ContextDataType || (exports.ContextDataType = {}));
    class ContextState {
        constructor(depth, includeHashCode = false, minimumAcceptedDifficulty, reservedItems = new Set(), reservedItemTypes = new Set(), data) {
            this.depth = depth;
            this.includeHashCode = includeHashCode;
            this.minimumAcceptedDifficulty = minimumAcceptedDifficulty;
            this.reservedItems = reservedItems;
            this.reservedItemTypes = reservedItemTypes;
            this.data = data;
        }
        get shouldIncludeHashCode() {
            return this.includeHashCode || this.reservedItems.size > 0 || this.reservedItemTypes.size > 0;
        }
        merge(state) {
            if (state.includeHashCode) {
                this.includeHashCode = true;
            }
            for (const item of state.reservedItems) {
                this.reservedItems.add(item);
            }
            for (const itemType of state.reservedItemTypes) {
                this.reservedItemTypes.add(itemType);
            }
            if (state.data) {
                if (!this.data) {
                    this.data = new Map();
                }
                for (const [type, value] of state.data) {
                    this.data.set(type, value);
                }
            }
        }
        reset() {
            this.depth = 0;
            this.includeHashCode = false;
            this.minimumAcceptedDifficulty = undefined;
            this.reservedItems.clear();
            this.reservedItemTypes.clear();
            this.data = undefined;
        }
        get(type) {
            return this.data ? this.data.get(type) : undefined;
        }
        set(type, value) {
            if (!this.data) {
                this.data = new Map();
            }
            this.data.set(type, value);
        }
        clone(increaseDepth) {
            return new ContextState(increaseDepth ? this.depth + 1 : this.depth, this.includeHashCode, this.minimumAcceptedDifficulty, new Set(this.reservedItems), new Set(this.reservedItemTypes), this.data ? new Map(this.data) : undefined);
        }
        getHashCode() {
            return `${this.reservedItems.size > 0 ? `Reserved: ${Array.from(this.reservedItems.values()).map(id => id).join(",")}` : ""}`;
        }
    }
    exports.ContextState = ContextState;
    class Context {
        constructor(player, base, inventory, state = new ContextState(0), calculatingDifficulty = false, initialState) {
            this.player = player;
            this.base = base;
            this.inventory = inventory;
            this.state = state;
            this.calculatingDifficulty = calculatingDifficulty;
            this.initialState = initialState;
        }
        toString() {
            return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined})`;
        }
        clone(calculatingDifficulty = false, increaseDepth = false) {
            return new Context(this.player, this.base, this.inventory, this.state.clone(increaseDepth), calculatingDifficulty, this.initialState ? this.initialState.clone(increaseDepth) : undefined);
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
            this.changes = new ContextState(this.state.depth);
            return this.changes;
        }
        unwatch() {
            this.changes = undefined;
        }
        isReservedItem(item) {
            if (this.state.reservedItems.has(item.id)) {
                this.markShouldIncludeHashCode();
                return true;
            }
            return false;
        }
        isReservedItemType(itemType) {
            return this.state.reservedItemTypes.has(itemType);
        }
        getData(type) {
            return this.state.get(type);
        }
        setData(type, value) {
            this.state.set(type, value);
            if (this.changes) {
                this.changes.set(type, value);
            }
        }
        addReservedItems(...items) {
            for (const item of items) {
                this.state.reservedItems.add(item.id);
                this.state.reservedItemTypes.add(item.type);
                if (this.changes) {
                    this.changes.reservedItems.add(item.id);
                    this.changes.reservedItemTypes.add(item.type);
                }
            }
        }
        setInitialState() {
            this.initialState = this.state.clone(false);
        }
        reset() {
            this.changes = undefined;
            if (this.initialState) {
                this.state = this.initialState.clone(false);
            }
            else {
                this.state.reset();
            }
            this.setData(ContextDataType.LastKnownPosition, this.player.getPoint());
        }
        getHashCode() {
            return this.state.getHashCode();
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
            const lastKnownPosition = this.getData(ContextDataType.LastKnownPosition);
            if (lastKnownPosition && (lastKnownPosition.x === undefined || lastKnownPosition.y === undefined || lastKnownPosition.z === undefined)) {
                console.error("invalid value", lastKnownPosition);
                console.trace("lastKnownPosition get");
            }
            return lastKnownPosition || this.player;
        }
    }
    exports.default = Context;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFPQSxJQUFZLGVBcUJYO0lBckJELFdBQVksZUFBZTtRQUMxQiwrRUFBaUIsQ0FBQTtRQUNqQiw2RUFBZ0IsQ0FBQTtRQUNoQiwyRUFBZSxDQUFBO1FBQ2YsdURBQUssQ0FBQTtRQUNMLHVEQUFLLENBQUE7UUFLTCwrSUFBaUQsQ0FBQTtRQUtqRCwrR0FBaUMsQ0FBQTtRQUtqQyx1R0FBNkIsQ0FBQTtJQUM5QixDQUFDLEVBckJXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBcUIxQjtJQWVELE1BQWEsWUFBWTtRQUV4QixZQUNRLEtBQWEsRUFDYixrQkFBMkIsS0FBSyxFQUNoQyx5QkFBOEMsRUFDckMsZ0JBQTZCLElBQUksR0FBRyxFQUFFLEVBQ3RDLG9CQUFpQyxJQUFJLEdBQUcsRUFBRSxFQUtuRCxJQUE0QztZQVQ1QyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2Isb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2hDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBcUI7WUFDckMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBQ3RDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBeUI7WUFLbkQsU0FBSSxHQUFKLElBQUksQ0FBd0M7UUFDcEQsQ0FBQztRQUVELElBQVcscUJBQXFCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDL0YsQ0FBQztRQUVNLEtBQUssQ0FBQyxLQUFtQjtZQUMvQixJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBRUQsS0FBSyxNQUFNLElBQUksSUFB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