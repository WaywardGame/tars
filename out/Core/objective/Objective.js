define(["require", "exports", "utilities/Log", "../context/IContext", "../../utilities/Logger", "../ITars"], function (require, exports, Log_1, IContext_1, Logger_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.contextDataKey = IContext_1.ContextDataType.LastAcquiredItem;
        }
        get log() {
            var _a, _b;
            if (Objective.enableLogging) {
                return (_a = this._log) !== null && _a !== void 0 ? _a : (this._log = Logger_1.loggerUtilities.createLog(this.getName()));
            }
            return (_b = this._log) !== null && _b !== void 0 ? _b : Log_1.nullLog;
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
            const walkPath = context.player.walkPath;
            if (walkPath) {
                for (let i = 0; i < Math.min(20, walkPath.path.length); i++) {
                    const point = walkPath.path[i];
                    const tile = context.island.getTile(point.x, point.y, context.player.z);
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
        setReserveType(reserveType) {
            this.reserveType = reserveType;
            return this;
        }
        passAcquireData(objective, reserveType) {
            this.contextDataKey = objective.contextDataKey;
            this.reserveType = reserveType !== null && reserveType !== void 0 ? reserveType : objective.reserveType;
            return this;
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
    Objective.enableLogging = false;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvb2JqZWN0aXZlL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUE4QixTQUFTO1FBQXZDO1lBTVcsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBaU9yRSxDQUFDO1FBNU1BLElBQVcsR0FBRzs7WUFDYixJQUFJLFNBQVMsQ0FBQyxhQUFhLEVBQUU7Z0JBQzVCLGFBQU8sSUFBSSxDQUFDLElBQUksb0NBQVQsSUFBSSxDQUFDLElBQUksR0FBSyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQzthQUMvRDtZQUVELE9BQU8sTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxhQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVNLFNBQVMsQ0FBQyxHQUFxQjtZQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRU0sV0FBVyxDQUFDLG1CQUE2QjtZQUMvQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFcEMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3ZEO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksbUJBQW1CLElBQUksSUFBSSxDQUFDLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDcEYsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBRTNCLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQ3pDO1lBRUQsSUFBSSxJQUFJLENBQUMscUJBQXFCLEtBQUssU0FBUyxFQUFFO2dCQUM3QyxRQUFRLElBQUksSUFBSSxJQUFJLENB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