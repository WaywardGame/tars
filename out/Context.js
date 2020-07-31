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
        ContextDataType[ContextDataType["WaitingForWaterStill"] = 8] = "WaitingForWaterStill";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFPQSxJQUFZLGVBMEJYO0lBMUJELFdBQVksZUFBZTtRQUMxQiwrRUFBaUIsQ0FBQTtRQUNqQiw2RUFBZ0IsQ0FBQTtRQUNoQiwyRUFBZSxDQUFBO1FBQ2YsdURBQUssQ0FBQTtRQUNMLHVEQUFLLENBQUE7UUFLTCwrSUFBaUQsQ0FBQTtRQUtqRCwrR0FBaUMsQ0FBQTtRQUtqQyx1R0FBNkIsQ0FBQTtRQUs3QixxRkFBb0IsQ0FBQTtJQUNyQixDQUFDLEVBMUJXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBMEIxQjtJQWdCRCxNQUFhLFlBQVk7UUFFeEIsWUFDUSxLQUFhLEVBQ2Isa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQ3JDLGdCQUE2QixJQUFJLEdBQUcsRUFBRSxFQUN0QyxvQkFBaUMsSUFBSSxHQUFHLEVBQUUsRUFLbkQsSUFBNEM7WUFUNUMsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQXFCO1lBQ3JDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUN0QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXlCO1lBS25ELFNBQUksR0FBSixJQUFJLENBQXdDO1FBQ3BELENBQUM7UUFFRCxJQUFXLHFCQUFxQjtZQUMvQixPQUFPLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFFTSxLQUFLLENBQUMsS0FBbUI7WUFDL0IsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFO2dCQUMxQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQzthQUM1QjtZQUVE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