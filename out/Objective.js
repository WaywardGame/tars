define(["require", "exports", "utilities/Log", "./core/Planner", "./IContext", "./utilities/Logger"], function (require, exports, Log_1, Planner_1, IContext_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.contextDataKey = IContext_1.ContextDataType.LastAcquiredItem;
        }
        static getPipelineString(objectives) {
            return objectives ? objectives.map(objective => Array.isArray(objective) ? Objective.getPipelineString(objective) : `${objective.getHashCode()} (${objective.getStatusMessage()})`).join(" -> ") : "Empty pipeline";
        }
        get log() {
            if (!Planner_1.default.isCreatingPlan) {
                if (this._log === undefined) {
                    this._log = Logger_1.loggerUtilities.createLog(this.getName());
                }
                return this._log;
            }
            return this._log || Log_1.nullLog;
        }
        setLogger(log) {
            this._log = log;
        }
        getHashCode(addUniqueIdentifier) {
            let hashCode = this.getIdentifier();
            if (hashCode.includes("[object")) {
                console.warn("Invalid objective identifier", hashCode);
            }
            if (this.isDynamic() || addUniqueIdentifier) {
                if (this._uniqueIdentifier === undefined) {
                    this._uniqueIdentifier = Objective.uuid++;
                    if (Objective.uuid >= Number.MAX_SAFE_INTEGER) {
                        Objective.uuid = 0;
                    }
                }
                hashCode += `:${this._uniqueIdentifier}`;
            }
            if (this._additionalDifficulty !== undefined) {
                hashCode += `:${this._additionalDifficulty}`;
            }
            if (this._overrideDifficulty !== undefined) {
                hashCode += `:${this._overrideDifficulty}`;
            }
            if (this.contextDataKey !== IContext_1.ContextDataType.LastAcquiredItem) {
                hashCode += `:${this.contextDataKey}`;
            }
            return hashCode;
        }
        toString() {
            return this.getHashCode();
        }
        getName() {
            return this.constructor.name;
        }
        getStatus() {
            return this.getIdentifier();
        }
        getStatusMessage() {
            switch (typeof (this._status)) {
                case "string":
                    return this._status;
                case "function":
                    return this._status();
                case "object":
                    return this._status.getStatusMessage();
                default:
                    return this.getStatus();
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
                    const tile = game.getTile(point.x, point.y, context.player.z);
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
        passContextDataKey(objective) {
            this.contextDataKey = objective.contextDataKey;
            return this;
        }
        getBaseDifficulty(_context) {
            return 0;
        }
    }
    exports.default = Objective;
    Objective.uuid = 0;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUE4QixTQUFTO1FBQXZDO1lBSVcsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBbU5yRSxDQUFDO1FBeE1PLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUF3RDtZQUN2RixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssU0FBUyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7UUFDck4sQ0FBQztRQU1ELElBQVcsR0FBRztZQUNiLElBQUksQ0FBQyxpQkFBTyxDQUFDLGNBQWMsRUFBRTtnQkFDNUIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLGFBQU8sQ0FBQztRQUM3QixDQUFDO1FBRU0sU0FBUyxDQUFDLEdBQXFCO1lBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxXQUFXLENBQUMsbUJBQTZCO1lBQy9DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLEVB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