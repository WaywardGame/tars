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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUE4QixTQUFTO1FBQXZDO1lBSVcsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBd05yRSxDQUFDO1FBN01PLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUF3RDtZQUN2RixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssU0FBUyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7UUFDck4sQ0FBQztRQVdELElBQVcsR0FBRztZQUNiLElBQUksQ0FBQyxpQkFBTyxDQUFDLGNBQWMsRUFBRTtnQkFDNUIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLGFBQU8sQ0FBQztRQUM3QixDQUFDO1FBRU0sU0FBUyxDQUFDLEdBQXFCO1lBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxXQUFXLENBQUMsbUJBQTZCO1lBQy9DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLEVB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