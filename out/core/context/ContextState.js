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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvY29udGV4dC9Db250ZXh0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBT0gsTUFBcUIsWUFBWTtRQUVoQyxZQUNRLFFBQWdCLENBQUMsRUFDakIsa0JBQTJCLEtBQUssRUFDaEMseUJBQThDLEVBQzlDLGFBQXNDLEVBQ3RDLHFDQUFrRSxFQUNsRSxpQ0FBMEQsRUFDMUQsYUFBcUMsRUFLckMsSUFBbUM7WUFYbkMsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFxQjtZQUM5QyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDdEMsMENBQXFDLEdBQXJDLHFDQUFxQyxDQUE2QjtZQUNsRSxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQXlCO1lBQzFELGtCQUFhLEdBQWIsYUFBYSxDQUF3QjtZQUtyQyxTQUFJLEdBQUosSUFBSSxDQUErQjtRQUMzQyxDQUFDO1FBRUQsSUFBVyxxQkFBcUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxxQ0FBcUMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUM7UUFDakssQ0FBQztRQUVNLEtBQUssQ0FBQyxLQUFtQjtZQUMvQixJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDN0IsQ0FBQztZQUVELElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsYUFBYSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRWpDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxD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