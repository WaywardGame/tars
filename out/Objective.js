define(["require", "exports", "utilities/Log", "./Core/Planner", "./IContext", "./Utilities/Logger"], function (require, exports, Log_1, Planner_1, IContext_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.contextDataKey = IContext_1.ContextDataType.LastAcquiredItem;
        }
        static getPipelineString(objectives) {
            return objectives ? objectives.map(objective => Array.isArray(objective) ? Objective.getPipelineString(objective) : objective.getHashCode()).join(" -> ") : "Empty pipeline";
        }
        get log() {
            if (!Planner_1.default.isCreatingPlan) {
                if (this._log === undefined) {
                    this._log = Logger_1.createLog(this.getName());
                }
                return this._log;
            }
            return this._log || Log_1.nullLog;
        }
        setLogger(log) {
            this._log = log;
        }
        getHashCode(context) {
            let hashCode = this.getIdentifier(context);
            if (this.isDynamic()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUE4QixTQUFTO1FBQXZDO1lBSVcsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBMk1yRSxDQUFDO1FBaE1PLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUF3RDtZQUN2RixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5SyxDQUFDO1FBTUQsSUFBVyxHQUFHO1lBQ2IsSUFBSSxDQUFDLGlCQUFPLENBQUMsY0FBYyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ3RDO2dCQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqQjtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxhQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVNLFNBQVMsQ0FBQyxHQUFxQjtZQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRU0sV0FBVyxDQUFDLE9BQWlCO1lBQ25DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0MsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFF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