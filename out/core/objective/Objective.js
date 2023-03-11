define(["require", "exports", "utilities/Log", "../context/IContext", "../ITars", "../ITarsOptions"], function (require, exports, Log_1, IContext_1, ITars_1, ITarsOptions_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvb2JqZWN0aXZlL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUE4QixTQUFTO1FBQXZDO1lBUVEsa0JBQWEsR0FBRyxJQUFJLENBQUM7WUFVbEIsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBNFFyRSxDQUFDO1FBMVJPLE1BQU0sQ0FBQyxLQUFLO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQWlDRCxJQUFXLEdBQUc7WUFDYixJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUVyQyxJQUFJLENBQUMsSUFBSSxHQUFHLGFBQU8sQ0FBQzthQUNwQjtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxhQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVNLFlBQVksQ0FBQyxlQUFnQztZQUNuRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMxRDtRQUNGLENBQUM7UUFFTSxTQUFTLENBQUMsR0FBcUI7WUFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDakIsQ0FBQztRQUVNLFdBQVcsQ0FBQyxPQUE0QixFQUFFLGtCQUE0QjtZQUM1RSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTNDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN2RDtZQUdELElBQUksT0FB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