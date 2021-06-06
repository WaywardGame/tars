define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ContextState {
        constructor(depth = 0, includeHashCode = false, minimumAcceptedDifficulty, reservedItems = new Set(), reservedItemTypes = new Set(), providedItems = new Map(), data) {
            this.depth = depth;
            this.includeHashCode = includeHashCode;
            this.minimumAcceptedDifficulty = minimumAcceptedDifficulty;
            this.reservedItems = reservedItems;
            this.reservedItemTypes = reservedItemTypes;
            this.providedItems = providedItems;
            this.data = data;
        }
        get shouldIncludeHashCode() {
            return this.includeHashCode || this.reservedItems.size > 0 || this.reservedItemTypes.size > 0 || this.providedItems.size > 0;
        }
        merge(state) {
            var _a;
            if (state.includeHashCode) {
                this.includeHashCode = true;
            }
            for (const item of state.reservedItems) {
                this.reservedItems.add(item);
            }
            for (const itemType of state.reservedItemTypes) {
                this.reservedItemTypes.add(itemType);
            }
            for (const item of state.providedItems) {
                this.providedItems.set(item[0], ((_a = this.providedItems.get(item[0])) !== null && _a !== void 0 ? _a : 0) + item[1]);
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
            return new ContextState(increaseDepth ? this.depth + 1 : this.depth, this.includeHashCode, this.minimumAcceptedDifficulty, new Set(this.reservedItems), new Set(this.reservedItemTypes), new Map(this.providedItems), this.data ? new Map(this.data) : undefined);
        }
        getHashCode() {
            let hashCode = "";
            if (this.reservedItems.size > 0) {
                hashCode += `Reserved: ${Array.from(this.reservedItems).map(id => id).join(",")}`;
            }
            if (this.providedItems.size > 0) {
                hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
            }
            return hashCode;
        }
    }
    exports.default = ContextState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbnRleHRTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFQSxNQUFxQixZQUFZO1FBRWhDLFlBQ1EsUUFBZ0IsQ0FBQyxFQUNqQixrQkFBMkIsS0FBSyxFQUNoQyx5QkFBOEMsRUFDckMsZ0JBQTZCLElBQUksR0FBRyxFQUFFLEVBQ3RDLG9CQUFtQyxJQUFJLEdBQUcsRUFBRSxFQUM1QyxnQkFBdUMsSUFBSSxHQUFHLEVBQUUsRUFLekQsSUFBbUM7WUFWbkMsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFxQjtZQUNyQyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDdEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtZQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBbUM7WUFLekQsU0FBSSxHQUFKLElBQUksQ0FBK0I7UUFDM0MsQ0FBQztRQUVELElBQVcscUJBQXFCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzlILENBQUM7UUFFTSxLQUFLLENBQUMsS0FBbUI7O1lBQy9CLElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7YUFDNUI7WUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCO1lBRUQsS0FBSyxNQUFNLFFBQVEsSUFBSSxL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