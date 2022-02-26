define(["require", "exports", "utilities/Log", "../context/IContext", "../../utilities/Logger", "../ITars"], function (require, exports, Log_1, IContext_1, Logger_1, ITars_1) {
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
            if (this.enableLogging) {
                return this._log ??= Logger_1.loggerUtilities.createLog(this.getName());
            }
            return this._log ?? Log_1.nullLog;
        }
        setLogger(log) {
            this._log = log;
        }
        getHashCode(context, addUniqueIdentifier) {
            let hashCode = this.getIdentifier(context);
            if (hashCode.includes("[object")) {
                console.warn("Invalid objective identifier", hashCode);
            }
            if (this.isDynamic() || addUniqueIdentifier || this._uniqueIdentifier !== undefined) {
                this.addUniqueIdentifier();
                hashCode += `:${this._uniqueIdentifier}`;
            }
            if (this._additionalDifficulty !== undefined) {
                hashCode += `:${this._additionalDifficulty}`;
            }
            if (this._overrideDifficulty !== undefined) {
                hashCode += `:${this._overrideDifficulty}`;
            }
            if (this.contextDataKey !== IContext_1.ContextDataType.LastAcquiredItem && this.contextDataKey.startsWith(this.getIdentifier(context))) {
                hashCode += `:[${this.contextDataKey}]`;
            }
            if (this.reserveType !== undefined) {
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
        canIncludeContextHashCode(context) {
            return false;
        }
        shouldIncludeContextHashCode(context) {
            return false;
        }
        addDifficulty(difficulty) {
            this._additionalDifficulty = (this._additionalDifficulty || 0) + difficulty;
            return this;
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
            let difficulty = this.getBaseDifficulty(context);
            if (this._additionalDifficulty !== undefined) {
                difficulty += this._additionalDifficulty;
            }
            return difficulty;
        }
        async onMove(context, ignoreCreature) {
            const walkPath = context.human.walkPath;
            if (walkPath) {
                for (let i = 0; i < Math.min(20, walkPath.path.length); i++) {
                    const point = walkPath.path[i];
                    const tile = context.island.getTile(point.x, point.y, context.human.z);
                    if ((tile.npc !== undefined && tile.npc !== context.human) || (tile.creature && !tile.creature.isTamed() && tile.creature !== ignoreCreature)) {
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
        addUniqueIdentifier() {
            if (this._uniqueIdentifier === undefined) {
                this._uniqueIdentifier = this.getUniqueIdentifier();
            }
        }
    }
    exports.default = Objective;
    Objective.uuid = 0;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvb2JqZWN0aXZlL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUE4QixTQUFTO1FBQXZDO1lBUVEsa0JBQWEsR0FBRyxJQUFJLENBQUM7WUFFbEIsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBcVFyRSxDQUFDO1FBM1FPLE1BQU0sQ0FBQyxLQUFLO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQTBCRCxJQUFXLEdBQUc7WUFDYixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUMvRDtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxhQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVNLFNBQVMsQ0FBQyxHQUFxQjtZQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRU0sV0FBVyxDQUFDLE9BQTRCLEVBQUUsbUJBQTZCO1lBQzdFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0MsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3ZEO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksbUJBQW1CLElBQUksSUFBSSxDQUFDLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDcEYsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBRTNCLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIs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