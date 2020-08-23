define(["require", "exports", "utilities/Log", "./Context", "./Core/Planner", "./Utilities/Logger"], function (require, exports, Log_1, Context_1, Planner_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.contextDataKey = Context_1.ContextDataType.LastAcquiredItem;
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
                    if (tile.creature && !tile.creature.isTamed() && tile.creature !== ignoreCreature) {
                        this.log.info("Creature moved along walk path, recalculating");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxNQUE4QixTQUFTO1FBQXZDO1lBSVcsbUJBQWMsR0FBVyx5QkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBdUtyRSxDQUFDO1FBOUpPLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUF3RDtZQUN2RixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5SyxDQUFDO1FBTUQsSUFBVyxHQUFHO1lBQ2IsSUFBSSxDQUFDLGlCQUFPLENBQUMsY0FBYyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ3RDO2dCQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqQjtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxhQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVNLFNBQVMsQ0FBQyxHQUFxQjtZQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRU0sV0FBVyxDQUFDLE9BQWlCO1lBQ25DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0MsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFF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