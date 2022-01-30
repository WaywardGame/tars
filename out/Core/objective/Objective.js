define(["require", "exports", "utilities/Log", "../context/IContext", "../../utilities/Logger", "../ITars"], function (require, exports, Log_1, IContext_1, Logger_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.enableLogging = true;
            this.contextDataKey = IContext_1.ContextDataType.LastAcquiredItem;
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
        getHashCode(addUniqueIdentifier) {
            let hashCode = this.getIdentifier();
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
            if (this.contextDataKey !== IContext_1.ContextDataType.LastAcquiredItem && this.contextDataKey.startsWith(this.getIdentifier())) {
                hashCode += `:[${this.contextDataKey}]`;
            }
            if (this.reserveType !== undefined) {
                hashCode += `:${ITars_1.ReserveType[this.reserveType]}`;
            }
            return hashCode;
        }
        toString() {
            return this.getHashCode();
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
            const walkPath = context.human.asPlayer?.walkPath;
            if (walkPath) {
                for (let i = 0; i < Math.min(20, walkPath.path.length); i++) {
                    const point = walkPath.path[i];
                    const tile = context.island.getTile(point.x, point.y, context.human.z);
                    if (tile.npc !== undefined || (tile.creature && !tile.creature.isTamed() && tile.creature !== ignoreCreature)) {
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
        addUniqueIdentifier() {
            if (this._uniqueIdentifier === undefined) {
                this._uniqueIdentifier = Objective.uuid++;
                if (Objective.uuid >= Number.MAX_SAFE_INTEGER) {
                    Objective.uuid = 0;
                }
            }
        }
    }
    exports.default = Objective;
    Objective.uuid = 0;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvb2JqZWN0aXZlL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUE4QixTQUFTO1FBQXZDO1lBSVEsa0JBQWEsR0FBRyxJQUFJLENBQUM7WUFFbEIsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBdVByRSxDQUFDO1FBak9BLElBQVcsR0FBRztZQUNiLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLHdCQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQy9EO1lBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLGFBQU8sQ0FBQztRQUM3QixDQUFDO1FBRU0sU0FBUyxDQUFDLEdBQXFCO1lBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxXQUFXLENBQUMsbUJBQTZCO1lBQy9DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVwQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkQ7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUNwRixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFFM0IsUUFBUSxJQUFJLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDekM7WUFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxTQUFTLEVBQUU7Z0JBQzdDLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FB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