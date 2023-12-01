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
define(["require", "exports", "@wayward/utilities/Log", "../context/IContext", "../ITars", "../ITarsOptions"], function (require, exports, Log_1, IContext_1, ITars_1, ITarsOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.enableLogging = true;
            this.contextDataKey = IContext_1.ContextDataType.LastAcquiredItem;
        }
        static reset() {
            this.uuid = 0;
        }
        get log() {
            if (this.enableLogging && !this._log) {
                this._log = Log_1.nullLog;
            }
            return this._log ?? Log_1.nullLog;
        }
        ensureLogger(loggerUtilities) {
            if (this._log === undefined) {
                this.setLogger(loggerUtilities.createLog(this.getName()));
            }
        }
        setLogger(log) {
            this._log = log;
        }
        getHashCode(context, skipContextDataKey) {
            let hashCode = this.getIdentifier(context);
            if (hashCode.includes("[object")) {
                console.warn("Invalid objective identifier", hashCode);
            }
            if (context && this.includePositionInHashCode !== false && (this.includePositionInHashCode || context.options.planningAccuracy === ITarsOptions_1.PlanningAccuracy.Accurate)) {
                const tile = context.getTile();
                hashCode += `:(${tile.x},${tile.y},${tile.z})`;
            }
            if (this.includeUniqueIdentifierInHashCode) {
                hashCode += `:${this._uniqueIdentifier ??= this.getUniqueIdentifier()}`;
            }
            if (this._overrideDifficulty !== undefined) {
                hashCode += `:${this._overrideDifficulty}`;
            }
            if (!skipContextDataKey && this.contextDataKey !== IContext_1.ContextDataType.LastAcquiredItem) {
                hashCode += `:[${this.contextDataKey}]`;
            }
            if (context && this.reserveType === ITars_1.ReserveType.Soft) {
                hashCode += `:${ITars_1.ReserveType[this.reserveType]}`;
            }
            return hashCode;
        }
        toString() {
            return this.getHashCode(undefined);
        }
        getName() {
            return this.constructor.name;
        }
        getStatusMessage(context) {
            switch (typeof (this._status)) {
                case "string":
                    return this._status;
                case "function":
                    return this._status();
                case "object":
                    return this._status.getStatusMessage(context);
                default:
                    return this.getStatus(context);
            }
        }
        setStatus(status) {
            this._status = status;
            return this;
        }
        canSaveChildObjectives() {
            return true;
        }
        canGroupTogether() {
            return false;
        }
        isDynamic() {
            return false;
        }
        canIncludeContextHashCode(context, objectiveHashCode) {
            return false;
        }
        shouldIncludeContextHashCode(context, objectiveHashCode) {
            return false;
        }
        overrideDifficulty(difficulty) {
            this._overrideDifficulty = difficulty;
            return this;
        }
        passOverriddenDifficulty(objective) {
            this._overrideDifficulty = objective._overrideDifficulty;
            return this;
        }
        isDifficultyOverridden() {
            return this._overrideDifficulty !== undefined;
        }
        getDifficulty(context) {
            if (this._overrideDifficulty !== undefined) {
                return this._overrideDifficulty;
            }
            return this.getBaseDifficulty(context);
        }
        async onMove(context, ignoreCreature) {
            const walkPath = context.human.walkPath;
            if (walkPath) {
                for (let i = 0; i < Math.min(10, walkPath.path.length); i++) {
                    const point = walkPath.path[i];
                    const tile = context.island.getTile(point.x, point.y, context.human.z);
                    if ((tile.npc !== undefined && tile.npc !== context.human) || (tile.creature && !tile.creature.isTamed && tile.creature !== ignoreCreature)) {
                        this.log.info("NPC or creature moved along walk path, recalculating");
                        return true;
                    }
                }
            }
            return false;
        }
        setContextDataKey(contextDataKey) {
            this.contextDataKey = contextDataKey;
            return this;
        }
        shouldKeepInInventory() {
            return this._shouldKeepInInventory ?? false;
        }
        keepInInventory() {
            this._shouldKeepInInventory = true;
            return this;
        }
        setReserveType(reserveType) {
            this.reserveType = reserveType;
            return this;
        }
        passAcquireData(objective, reserveType) {
            this.contextDataKey = objective.contextDataKey;
            this._shouldKeepInInventory = objective._shouldKeepInInventory;
            this.reserveType = reserveType ?? objective.reserveType;
            return this;
        }
        passShouldKeepInInventory(objective) {
            this._shouldKeepInInventory = objective._shouldKeepInInventory;
            return this;
        }
        getAcquiredItem(context) {
            return context.getData(this.contextDataKey);
        }
        getBaseDifficulty(_context) {
            return 0;
        }
        getUniqueIdentifier() {
            const uniqueIdentifier = Objective.uuid++;
            if (Objective.uuid >= Number.MAX_SAFE_INTEGER) {
                Objective.uuid = 0;
            }
            return uniqueIdentifier;
        }
        getUniqueContextDataKey(itemIdentifier) {
            return `${this.getHashCode(undefined, true)}:${itemIdentifier}`;
        }
    }
    Objective.uuid = 0;
    exports.default = Objective;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvb2JqZWN0aXZlL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFjSCxNQUE4QixTQUFTO1FBQXZDO1lBUVEsa0JBQWEsR0FBRyxJQUFJLENBQUM7WUFVbEIsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBNFFyRSxDQUFDO1FBMVJPLE1BQU0sQ0FBQyxLQUFLO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQWlDRCxJQUFXLEdBQUc7WUFDYixJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXRDLElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBTyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksYUFBTyxDQUFDO1FBQzdCLENBQUM7UUFFTSxZQUFZLENBQUMsZUFBZ0M7WUFDbkQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0YsQ0FBQztRQUVNLFNBQVMsQ0FBQyxHQUFxQjtZQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRU0sV0FBVyxDQUFDLE9BQTRCLEVBQUUsa0JBQTRCO1lBQzVFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0MsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJB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