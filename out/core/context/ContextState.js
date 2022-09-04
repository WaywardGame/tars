define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ContextState {
        constructor(depth = 0, includeHashCode = false, minimumAcceptedDifficulty, softReservedItems = new Set(), hardReservedItems = new Set(), reservedItemTypesPerObjectiveHashCode = new Map(), reservedItemsPerObjectiveHashCode = new Map(), providedItems = new Map(), data) {
            this.depth = depth;
            this.includeHashCode = includeHashCode;
            this.minimumAcceptedDifficulty = minimumAcceptedDifficulty;
            this.softReservedItems = softReservedItems;
            this.hardReservedItems = hardReservedItems;
            this.reservedItemTypesPerObjectiveHashCode = reservedItemTypesPerObjectiveHashCode;
            this.reservedItemsPerObjectiveHashCode = reservedItemsPerObjectiveHashCode;
            this.providedItems = providedItems;
            this.data = data;
        }
        get shouldIncludeHashCode() {
            return this.includeHashCode || this.softReservedItems.size > 0 || this.hardReservedItems.size > 0 || this.reservedItemTypesPerObjectiveHashCode.size > 0 || this.providedItems.size > 0;
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
            for (const [itemType, objectiveHashCodes] of state.reservedItemTypesPerObjectiveHashCode) {
                let existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
                if (!existingSet) {
                    existingSet = new Set(objectiveHashCodes);
                    this.reservedItemTypesPerObjectiveHashCode.set(itemType, existingSet);
                }
                else {
                    for (const objectiveHashCode of objectiveHashCodes) {
                        existingSet.add(objectiveHashCode);
                    }
                }
            }
            for (const [item, objectiveHashCodes] of state.reservedItemsPerObjectiveHashCode) {
                let existingSet = this.reservedItemsPerObjectiveHashCode.get(item);
                if (!existingSet) {
                    existingSet = new Set(objectiveHashCodes);
                    this.reservedItemsPerObjectiveHashCode.set(item, existingSet);
                }
                else {
                    for (const objectiveHashCode of objectiveHashCodes) {
                        existingSet.add(objectiveHashCode);
                    }
                }
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
            this.reservedItemTypesPerObjectiveHashCode.clear();
            this.reservedItemsPerObjectiveHashCode.clear();
            this.providedItems.clear();
            this.data = undefined;
        }
        get(type) {
            return this.data?.get(type);
        }
        set(type, value) {
            if (value !== undefined) {
                if (!this.data) {
                    this.data = new Map();
                }
                this.data.set(type, value);
            }
            else if (this.data?.delete(type) && this.data.size === 0) {
                this.data = undefined;
            }
        }
        addReservedItemTypeForObjectiveHashCode(itemType, objectiveHashCode = "") {
            let existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
            if (!existingSet) {
                existingSet = new Set([objectiveHashCode]);
                this.reservedItemTypesPerObjectiveHashCode.set(itemType, existingSet);
            }
            else {
                existingSet.add(objectiveHashCode);
            }
        }
        addReservedItemForObjectiveHashCode(item, objectiveHashCode) {
            let existingSet = this.reservedItemsPerObjectiveHashCode.get(item);
            if (!existingSet) {
                existingSet = new Set([objectiveHashCode]);
                this.reservedItemsPerObjectiveHashCode.set(item, existingSet);
            }
            else {
                existingSet.add(objectiveHashCode);
            }
        }
        clone(increaseDepth) {
            return new ContextState(increaseDepth ? this.depth + 1 : this.depth, this.includeHashCode, this.minimumAcceptedDifficulty, new Set(this.softReservedItems), new Set(this.hardReservedItems), new Map(this.reservedItemTypesPerObjectiveHashCode), new Map(this.reservedItemsPerObjectiveHashCode), new Map(this.providedItems), this.data ? new Map(this.data) : undefined);
        }
        getHashCode() {
            let hashCode = "";
            if (this.softReservedItems.size > 0) {
                hashCode += `Soft Reserved: ${Array.from(this.softReservedItems).map(item => item.id).join(",")}`;
            }
            if (this.hardReservedItems.size > 0) {
                hashCode += `Hard Reserved: ${Array.from(this.hardReservedItems).map(item => item.id).join(",")}`;
            }
            if (this.providedItems.size > 0) {
                hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
            }
            return hashCode;
        }
        getFilteredHashCode(filter) {
            let hashCode = "";
            if (filter instanceof Set) {
                const allowedItemTypes = filter;
                if (this.softReservedItems.size > 0) {
                    const filteredSoftReservedItems = Array.from(this.softReservedItems).filter(item => allowedItemTypes.has(item.type));
                    if (filteredSoftReservedItems.length > 0) {
                        hashCode += `Soft Reserved: ${filteredSoftReservedItems.map(item => item.id).join(",")}`;
                    }
                }
                if (this.hardReservedItems.size > 0) {
                    const filteredHardReservedItems = Array.from(this.hardReservedItems).filter(item => allowedItemTypes.has(item.type));
                    if (filteredHardReservedItems.length > 0) {
                        hashCode += `Hard Reserved: ${filteredHardReservedItems.map(item => item.id).join(",")}`;
                    }
                }
                if (this.providedItems.size > 0) {
                    const filteredProvidedItems = Array.from(this.providedItems).filter(itemType => allowedItemTypes.has(itemType[0]));
                    if (filteredProvidedItems.length > 0) {
                        hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
                    }
                }
            }
            else {
                const objectiveHashCode = filter.objectiveHashCode;
                const allowedItemTypes = filter.itemTypes;
                if (this.softReservedItems.size > 0) {
                    const filteredSoftReservedItems = Array.from(this.softReservedItems)
                        .filter(item => allowedItemTypes.has(item.type) && this.reservedItemsPerObjectiveHashCode.get(item)?.has(objectiveHashCode));
                    if (filteredSoftReservedItems.length > 0) {
                        hashCode += `Soft Reserved: ${filteredSoftReservedItems.map(item => item.id).join(",")}`;
                    }
                }
                if (this.hardReservedItems.size > 0) {
                    const filteredHardReservedItems = Array.from(this.hardReservedItems)
                        .filter(item => allowedItemTypes.has(item.type) && this.reservedItemsPerObjectiveHashCode.get(item)?.has(objectiveHashCode));
                    if (filteredHardReservedItems.length > 0) {
                        hashCode += `Hard Reserved: ${filteredHardReservedItems.map(item => item.id).join(",")}`;
                    }
                }
                if (this.providedItems.size > 0) {
                    const filteredProvidedItems = Array.from(this.providedItems)
                        .filter(([itemType]) => allowedItemTypes.has(itemType));
                    if (filteredProvidedItems.length > 0) {
                        hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
                    }
                }
            }
            return hashCode;
        }
    }
    exports.default = ContextState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvY29udGV4dC9Db250ZXh0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBSUEsTUFBcUIsWUFBWTtRQUVoQyxZQUNRLFFBQWdCLENBQUMsRUFDakIsa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQ3JDLG9CQUErQixJQUFJLEdBQUcsRUFBRSxFQUN4QyxvQkFBK0IsSUFBSSxHQUFHLEVBQUUsRUFDeEMsd0NBQW9FLElBQUksR0FBRyxFQUFFLEVBQzdFLG9DQUE0RCxJQUFJLEdBQUcsRUFBRSxFQUNyRSxnQkFBdUMsSUFBSSxHQUFHLEVBQUUsRUFLekQsSUFBbUM7WUFabkMsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFxQjtZQUNyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXVCO1lBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBdUI7WUFDeEMsMENBQXFDLEdBQXJDLHFDQUFxQyxDQUF3QztZQUM3RSxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW9DO1lBQ3JFLGtCQUFhLEdBQWIsYUFBYSxDQUFtQztZQUt6RCxTQUFJLEdBQUosSUFBSSxDQUErQjtRQUMzQyxDQUFDO1FBRUQsSUFBVyxxQkFBcUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUN6TCxDQUFDO1FBRU0sS0FBSyxDQUFDLEtBQW1CO1lBQy9CLElBQUksS0FBSyxD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