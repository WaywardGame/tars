define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ContextState {
        constructor(depth = 0, includeHashCode = false, minimumAcceptedDifficulty, softReservedItems = new Set(), hardReservedItems = new Set(), reservedItemTypes = new Set(), reservedItemTypesPerObjectiveHashCode = new Map(), providedItems = new Map(), data) {
            this.depth = depth;
            this.includeHashCode = includeHashCode;
            this.minimumAcceptedDifficulty = minimumAcceptedDifficulty;
            this.softReservedItems = softReservedItems;
            this.hardReservedItems = hardReservedItems;
            this.reservedItemTypes = reservedItemTypes;
            this.reservedItemTypesPerObjectiveHashCode = reservedItemTypesPerObjectiveHashCode;
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
            this.reservedItemTypesPerObjectiveHashCode.clear();
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
        addReservedItemTypesForObjectiveHashCode(itemType, objectiveHashCode) {
            let existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
            if (!existingSet) {
                existingSet = new Set([objectiveHashCode]);
                this.reservedItemTypesPerObjectiveHashCode.set(itemType, existingSet);
            }
            else {
                existingSet.add(objectiveHashCode);
            }
        }
        clone(increaseDepth) {
            return new ContextState(increaseDepth ? this.depth + 1 : this.depth, this.includeHashCode, this.minimumAcceptedDifficulty, new Set(this.softReservedItems), new Set(this.hardReservedItems), new Set(this.reservedItemTypes), new Map(this.reservedItemTypesPerObjectiveHashCode), new Map(this.providedItems), this.data ? new Map(this.data) : undefined);
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
                        .filter(item => allowedItemTypes.has(item.type) && this.reservedItemTypesPerObjectiveHashCode.get(item.type)?.has(objectiveHashCode));
                    if (filteredSoftReservedItems.length > 0) {
                        hashCode += `Soft Reserved: ${filteredSoftReservedItems.map(item => item.id).join(",")}`;
                    }
                }
                if (this.hardReservedItems.size > 0) {
                    const filteredHardReservedItems = Array.from(this.hardReservedItems)
                        .filter(item => allowedItemTypes.has(item.type) && this.reservedItemTypesPerObjectiveHashCode.get(item.type)?.has(objectiveHashCode));
                    if (filteredHardReservedItems.length > 0) {
                        hashCode += `Hard Reserved: ${filteredHardReservedItems.map(item => item.id).join(",")}`;
                    }
                }
                if (this.providedItems.size > 0) {
                    const filteredProvidedItems = Array.from(this.providedItems)
                        .filter(([itemType]) => allowedItemTypes.has(itemType) && this.reservedItemTypesPerObjectiveHashCode.get(itemType)?.has(objectiveHashCode));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvY29udGV4dC9Db250ZXh0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBSUEsTUFBcUIsWUFBWTtRQUVoQyxZQUNRLFFBQWdCLENBQUMsRUFDakIsa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQ3JDLG9CQUErQixJQUFJLEdBQUcsRUFBRSxFQUN4QyxvQkFBK0IsSUFBSSxHQUFHLEVBQUUsRUFDeEMsb0JBQW1DLElBQUksR0FBRyxFQUFFLEVBQzVDLHdDQUFvRSxJQUFJLEdBQUcsRUFBRSxFQUM3RSxnQkFBdUMsSUFBSSxHQUFHLEVBQUUsRUFLekQsSUFBbUM7WUFabkMsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFxQjtZQUNyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXVCO1lBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBdUI7WUFDeEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtZQUM1QywwQ0FBcUMsR0FBckMscUNBQXFDLENBQXdDO1lBQzdFLGtCQUFhLEdBQWIsYUFBYSxDQUFtQztZQUt6RCxTQUFJLEdBQUosSUFBSSxDQUErQjtRQUMzQyxDQUFDO1FBRUQsSUFBVyxxQkFBcUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNySyxDQUFDO1FBRU0sS0FBSyxDQUFDLEtBQW1CO1lBQy9CLElBQUksS0FBSyxD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