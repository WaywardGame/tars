/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ContextState {
        constructor(depth = 0, includeHashCode = false, minimumAcceptedDifficulty, reservedItems, reservedItemTypesPerObjectiveHashCode, reservedItemsPerObjectiveHashCode, providedItems, data) {
            this.depth = depth;
            this.includeHashCode = includeHashCode;
            this.minimumAcceptedDifficulty = minimumAcceptedDifficulty;
            this.reservedItems = reservedItems;
            this.reservedItemTypesPerObjectiveHashCode = reservedItemTypesPerObjectiveHashCode;
            this.reservedItemsPerObjectiveHashCode = reservedItemsPerObjectiveHashCode;
            this.providedItems = providedItems;
            this.data = data;
        }
        get shouldIncludeHashCode() {
            return this.includeHashCode || this.reservedItems !== undefined || this.reservedItemTypesPerObjectiveHashCode !== undefined || this.providedItems !== undefined;
        }
        merge(state) {
            if (state.includeHashCode) {
                this.includeHashCode = true;
            }
            if (state.reservedItems) {
                this.reservedItems ??= new Map();
                for (const [k, v] of state.reservedItems) {
                    this.reservedItems.set(k, v);
                }
            }
            if (state.reservedItemTypesPerObjectiveHashCode) {
                this.reservedItemTypesPerObjectiveHashCode ??= new Map();
                for (const [itemType, objectiveHashCodes] of state.reservedItemTypesPerObjectiveHashCode) {
                    const existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
                    if (!existingSet) {
                        this.reservedItemTypesPerObjectiveHashCode.set(itemType, new Set(objectiveHashCodes));
                    }
                    else {
                        for (const objectiveHashCode of objectiveHashCodes) {
                            existingSet.add(objectiveHashCode);
                        }
                    }
                }
            }
            if (state.reservedItemsPerObjectiveHashCode) {
                this.reservedItemsPerObjectiveHashCode ??= new Map();
                for (const [item, objectiveHashCodes] of state.reservedItemsPerObjectiveHashCode) {
                    const existingSet = this.reservedItemsPerObjectiveHashCode.get(item);
                    if (!existingSet) {
                        this.reservedItemsPerObjectiveHashCode.set(item, new Set(objectiveHashCodes));
                    }
                    else {
                        for (const objectiveHashCode of objectiveHashCodes) {
                            existingSet.add(objectiveHashCode);
                        }
                    }
                }
            }
            if (state.providedItems) {
                this.providedItems ??= new Map();
                for (const [itemType, amount] of state.providedItems) {
                    const newValue = (this.providedItems.get(itemType) ?? 0) + amount;
                    if (newValue !== 0) {
                        this.providedItems.set(itemType, newValue);
                    }
                    else {
                        this.providedItems.delete(itemType);
                    }
                }
                if (this.providedItems.size === 0) {
                    this.providedItems = undefined;
                }
            }
            if (state.data) {
                if (!this.data) {
                    this.data = new Map();
                }
                for (const [type, value] of state.data) {
                    if (value === undefined) {
                        this.data.delete(type);
                    }
                    else {
                        this.data.set(type, value);
                    }
                }
                if (this.data.size === 0) {
                    this.data = undefined;
                }
            }
        }
        reset() {
            this.depth = 0;
            this.includeHashCode = false;
            this.minimumAcceptedDifficulty = undefined;
            this.reservedItems = undefined;
            this.reservedItemTypesPerObjectiveHashCode = undefined;
            this.reservedItemsPerObjectiveHashCode = undefined;
            this.providedItems = undefined;
            this.data = undefined;
        }
        has(type) {
            return this.data?.has(type) ?? false;
        }
        get(type) {
            return this.data?.get(type);
        }
        set(type, value, trackUndefined) {
            if (value !== undefined || trackUndefined) {
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
            this.reservedItemTypesPerObjectiveHashCode ??= new Map();
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
            this.addReservedItemTypeForObjectiveHashCode(item.type, objectiveHashCode);
            this.reservedItemsPerObjectiveHashCode ??= new Map();
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
            return new ContextState(increaseDepth ? this.depth + 1 : this.depth, this.includeHashCode, this.minimumAcceptedDifficulty, this.reservedItems ? new Map(this.reservedItems) : undefined, this.reservedItemTypesPerObjectiveHashCode ? new Map(this.reservedItemTypesPerObjectiveHashCode) : undefined, this.reservedItemsPerObjectiveHashCode ? new Map(this.reservedItemsPerObjectiveHashCode) : undefined, this.providedItems ? new Map(this.providedItems) : undefined, this.data ? new Map(this.data) : undefined);
        }
        getHashCode() {
            let hashCode = "";
            if (this.reservedItems) {
                hashCode += `Reserved: ${Array.from(this.reservedItems).map(reserved => `${reserved[0]}:${reserved[1]}`).join(",")}`;
            }
            if (this.providedItems) {
                hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
            }
            return hashCode;
        }
        getFilteredHashCode(filter) {
            let hashCode = "";
            if (filter instanceof Set) {
                const allowedItemTypes = filter;
                if (this.reservedItems) {
                    const filteredReservedItems = Array.from(this.reservedItems).filter(reserved => allowedItemTypes.has(reserved[0].type));
                    if (filteredReservedItems.length > 0) {
                        hashCode += `Reserved: ${filteredReservedItems.map(reserved => reserved[0].id).join(",")}`;
                    }
                }
                if (this.providedItems) {
                    const filteredProvidedItems = Array.from(this.providedItems).filter(itemType => allowedItemTypes.has(itemType[0]));
                    if (filteredProvidedItems.length > 0) {
                        hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
                    }
                }
            }
            else {
                const objectiveHashCode = filter.objectiveHashCode;
                const allowedItemTypes = filter.itemTypes;
                if (this.reservedItems) {
                    const filteredReservedItems = Array.from(this.reservedItems)
                        .filter(reserved => allowedItemTypes.has(reserved[0].type) && this.reservedItemsPerObjectiveHashCode?.get(reserved[0])?.has(objectiveHashCode));
                    if (filteredReservedItems.length > 0) {
                        hashCode += `Reserved: ${filteredReservedItems.map(reserved => reserved[0].id).join(",")}`;
                    }
                }
                if (this.providedItems) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvY29udGV4dC9Db250ZXh0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBT0gsTUFBcUIsWUFBWTtRQUVoQyxZQUNRLFFBQWdCLENBQUMsRUFDakIsa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQzlDLGFBQXNDLEVBQ3RDLHFDQUFrRSxFQUNsRSxpQ0FBMEQsRUFDMUQsYUFBcUMsRUFLckMsSUFBbUM7WUFYbkMsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFxQjtZQUM5QyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDdEMsMENBQXFDLEdBQXJDLHFDQUFxQyxDQUE2QjtZQUNsRSxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQXlCO1lBQzFELGtCQUFhLEdBQWIsYUFBYSxDQUF3QjtZQUtyQyxTQUFJLEdBQUosSUFBSSxDQUErQjtRQUMzQyxDQUFDO1FBRUQsSUFBVyxxQkFBcUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxxQ0FBcUMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUM7UUFDakssQ0FBQztRQUVNLEtBQUssQ0FBQyxLQUFtQjtZQUMvQixJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBRUQsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFO2dCQUN4QixJQUFJLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRWpDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxL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