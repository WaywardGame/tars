define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextState = exports.ContextDataType = void 0;
    var ContextDataType;
    (function (ContextDataType) {
        ContextDataType["LastKnownPosition"] = "LastKnownPosition";
        ContextDataType["LastAcquiredItem"] = "LastAcquiredItem";
        ContextDataType["LastBuiltDoodad"] = "LastBuiltDoodad";
        ContextDataType["Item1"] = "Item1";
        ContextDataType["AllowOrganizingReservedItemsIntoIntermediateChest"] = "AllowOrganizingReservedItemsIntoIntermediateChest";
        ContextDataType["NextActionAllowsIntermediateChest"] = "NextActionAllowsIntermediateChest";
        ContextDataType["CanCraftFromIntermediateChest"] = "CanCraftFromIntermediateChest";
        ContextDataType["PrioritizeBaseChests"] = "PrioritizeBaseChests";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFNQSxJQUFZLGVBeUJYO0lBekJELFdBQVksZUFBZTtRQUMxQiwwREFBdUMsQ0FBQTtRQUN2Qyx3REFBcUMsQ0FBQTtRQUNyQyxzREFBbUMsQ0FBQTtRQUNuQyxrQ0FBZSxDQUFBO1FBS2YsMEhBQXVHLENBQUE7UUFLdkcsMEZBQXVFLENBQUE7UUFLdkUsa0ZBQStELENBQUE7UUFLL0QsZ0VBQTZDLENBQUE7SUFDOUMsQ0FBQyxFQXpCVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQXlCMUI7SUFFRCxNQUFhLFlBQVk7UUFFeEIsWUFDUSxLQUFhLEVBQ2Isa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQ3JDLGdCQUE2QixJQUFJLEdBQUcsRUFBRSxFQUN0QyxvQkFBaUMsSUFBSSxHQUFHLEVBQUUsRUFLbkQsSUFBbUM7WUFUbkMsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQXFCO1lBQ3JDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUN0QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXlCO1lBS25ELFNBQUksR0FBSixJQUFJLENBQStCO1FBQzNDLENBQUM7UUFFRCxJQUFXLHFCQUFxQjtZQUMvQixPQUFPLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFFTSxLQUFLLENBQUMsS0FBbUI7WUFDL0IsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFO2dCQUMxQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQzthQUM1QjtZQUVELEtBQUssTUFBTSxJQUFJ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