define(["require", "exports", "./ContextState", "./IContext"], function (require, exports, ContextState_1, IContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Context {
        constructor(player, base, inventory, options, state = new ContextState_1.default(), calculatingDifficulty = false, initialState) {
            this.player = player;
            this.base = base;
            this.inventory = inventory;
            this.options = options;
            this.state = state;
            this.calculatingDifficulty = calculatingDifficulty;
            this.initialState = initialState;
        }
        toString() {
            return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined})`;
        }
        clone(calculatingDifficulty = false, increaseDepth = false) {
            return new Context(this.player, this.base, this.inventory, this.options, this.state.clone(increaseDepth), calculatingDifficulty, this.initialState ? this.initialState.clone(increaseDepth) : undefined);
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
        getDataOrDefault(type, defaultValue) {
            var _a;
            return (_a = this.getData(type)) !== null && _a !== void 0 ? _a : defaultValue;
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
        setInitialState(state = this.state.clone(false)) {
            this.initialState = state;
        }
        reset() {
            this.changes = undefined;
            if (this.initialState) {
                this.state = this.initialState.clone(false);
            }
            else {
                this.state.reset();
            }
            this.setData(IContext_1.ContextDataType.Position, this.player.getPoint());
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
            const position = this.getData(IContext_1.ContextDataType.Position);
            if (position && (position.x === undefined || position.y === undefined || position.z === undefined)) {
                console.error("invalid value", position);
                console.trace("lastKnownPosition get");
            }
            return position || this.player.getPoint();
        }
    }
    exports.default = Context;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVNBLE1BQXFCLE9BQU87UUFJM0IsWUFDaUIsTUFBYyxFQUNkLElBQVcsRUFDWCxTQUEwQixFQUMxQixPQUErQixFQUN4QyxRQUFRLElBQUksc0JBQVksRUFBRSxFQUNqQix3QkFBaUMsS0FBSyxFQUM5QyxZQUEyQjtZQU5uQixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsU0FBSSxHQUFKLElBQUksQ0FBTztZQUNYLGNBQVMsR0FBVCxTQUFTLENBQWlCO1lBQzFCLFlBQU8sR0FBUCxPQUFPLENBQXdCO1lBQ3hDLFVBQUssR0FBTCxLQUFLLENBQXFCO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBaUI7WUFDOUMsaUJBQVksR0FBWixZQUFZLENBQWU7UUFDcEMsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQztRQUMzTSxDQUFDO1FBRU0sS0FBSyxDQUFDLHdCQUFpQyxLQUFLLEVBQUUsZ0JBQXlCLEtBQUs7WUFDbEYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxL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