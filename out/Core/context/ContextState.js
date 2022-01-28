define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ContextState {
        constructor(depth = 0, includeHashCode = false, minimumAcceptedDifficulty, softReservedItems = new Set(), hardReservedItems = new Set(), reservedItemTypes = new Set(), providedItems = new Map(), data) {
            this.depth = depth;
            this.includeHashCode = includeHashCode;
            this.minimumAcceptedDifficulty = minimumAcceptedDifficulty;
            this.softReservedItems = softReservedItems;
            this.hardReservedItems = hardReservedItems;
            this.reservedItemTypes = reservedItemTypes;
            this.providedItems = providedItems;
            this.data = data;
        }
        get shouldIncludeHashCode() {
            return this.includeHashCode || this.softReservedItems.size > 0 || this.hardReservedItems.size > 0 || this.reservedItemTypes.size > 0 || this.providedItems.size > 0;
        }
        merge(state) {
            if (state.includeHashCode) {
                this.includeHashCode = true;
            }
            for (const item of state.softReservedItems) {
                this.softReservedItems.add(item);
            }
            for (const item of state.hardReservedItems) {
                this.hardReservedItems.add(item);
            }
            for (const itemType of state.reservedItemTypes) {
                this.reservedItemTypes.add(itemType);
            }
            for (const item of state.providedItems) {
                this.providedItems.set(item[0], (this.providedItems.get(item[0]) ?? 0) + item[1]);
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
            this.softReservedItems.clear();
            this.hardReservedItems.clear();
            this.reservedItemTypes.clear();
            this.providedItems.clear();
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
            return new ContextState(increaseDepth ? this.depth + 1 : this.depth, this.includeHashCode, this.minimumAcceptedDifficulty, new Set(this.softReservedItems), new Set(this.hardReservedItems), new Set(this.reservedItemTypes), new Map(this.providedItems), this.data ? new Map(this.data) : undefined);
        }
        getHashCode() {
            let hashCode = "";
            if (this.softReservedItems.size > 0) {
                hashCode += `Soft Reserved: ${Array.from(this.softReservedItems).map(id => id).join(",")}`;
            }
            if (this.hardReservedItems.size > 0) {
                hashCode += `Hard Reserved: ${Array.from(this.hardReservedItems).map(id => id).join(",")}`;
            }
            if (this.providedItems.size > 0) {
                hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
            }
            return hashCode;
        }
    }
    exports.default = ContextState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvY29udGV4dC9Db250ZXh0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRUEsTUFBcUIsWUFBWTtRQUVoQyxZQUNRLFFBQWdCLENBQUMsRUFDakIsa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQ3JDLG9CQUFpQyxJQUFJLEdBQUcsRUFBRSxFQUMxQyxvQkFBaUMsSUFBSSxHQUFHLEVBQUUsRUFDMUMsb0JBQW1DLElBQUksR0FBRyxFQUFFLEVBQzVDLGdCQUF1QyxJQUFJLEdBQUcsRUFBRSxFQUt6RCxJQUFtQztZQVhuQyxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQ2pCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQXFCO1lBQ3JDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBeUI7WUFDMUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUF5QjtZQUMxQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQTJCO1lBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFtQztZQUt6RCxTQUFJLEdBQUosSUFBSSxDQUErQjtRQUMzQyxDQUFDO1FBRUQsSUFBVyxxQkFBcUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNySyxDQUFDO1FBRU0sS0FBSyxDQUFDLEtBQW1CO1lBQy9CLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7YUFDNUI7WUFF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