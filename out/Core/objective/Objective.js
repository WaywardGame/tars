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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvb2JqZWN0aXZlL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUE4QixTQUFTO1FBQXZDO1lBSVEsa0JBQWEsR0FBRyxJQUFJLENBQUM7WUFFbEIsbUJBQWMsR0FBVywwQkFBZSxDQUFDLGdCQUFnQixDQUFDO1FBcVFyRSxDQUFDO1FBL09BLElBQVcsR0FBRztZQUNiLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLHdCQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQy9EO1lBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLGFBQU8sQ0FBQztRQUM3QixDQUFDO1FBRU0sU0FBUyxDQUFDLEdBQXFCO1lBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxXQUFXLENBQUMsT0FBNEIsRUFBRSxtQkFBNkI7WUFDN0UsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUzQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkQ7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUNwRixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFFM0IsUUFBUSxJQUFJLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDekM7WUFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxTQUFTLEVBQUU7Z0JBQzdDLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2FBQzdDO1lBRUQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO2dCQUMzQyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzthQUMzQztZQUtELElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSywwQkFBZSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtnQkFDNUgsUUFBUSxJQUFJLEtBQUssSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDO2FBQ3hDO1lBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDbkMsUUFBUSxJQUFJLElBQUksbUJBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzthQUNoRDtZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxRQUFRO1lBQ2QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTSxPQUFPO1lBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUM5QixDQUFDO1FBS00sZ0JBQWdCLENBQUMsT0FBZ0I7WUFDdkMsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM5QixLQUFLLFFBQVE7b0JBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUVyQixLQUFLLFVBQVU7b0JBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRXZCLEtBQUssUUFBUTtvQkFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRS9DO29CQUNDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNoQztRQUNGLENBQUM7UUFFTSxTQUFTLENBQUMsTUFBNEM7WUFDNUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBS00sc0JBQXNCO1lBQzVCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQU1NLGdCQUFnQjtZQUN0QixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFLTSxTQUFTO1lBQ2YsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTU0seUJBQXlCLENBQUMsT0FBZ0I7WUFDaEQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBT00sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sYUFBYSxDQUFDLFVBQWtCO1lBQ3RDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7WUFDNUUsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sa0JBQWtCLENBQUMsVUFBOEI7WUFDdkQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSx3QkFBd0IsQ0FBQyxTQUFvQjtZQUNuRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDLG1CQUFtQixDQUFDO1lBQ3pELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLENBQUM7UUFDL0MsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQUU7Z0JBQzNDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO2FBQ2hDO1lBRUQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWpELElBQUksSUFBSSxDQUFDLHFCQUFxQixLQUFLLFNBQVMsRUFBRTtnQkFDN0MsVUFBVSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQzthQUN6QztZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFLTSxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQWdCLEVBQUUsY0FBeUI7WUFDOUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFDeEMsSUFBSSxRQUFRLEVBQUU7Z0JBRWIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzVELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9CLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2RSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLGNBQWMsQ0FBQyxFQUFFO3dCQUM5SSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO3dCQUN0RSxPQUFPLElBQUksQ0FBQztxQkFDWjtpQkFDRDthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBTU0saUJBQWlCLENBQUMsY0FBc0I7WUFDOUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFDckMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0scUJBQXFCO1lBQzNCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixJQUFJLEtBQUssQ0FBQztRQUM3QyxDQUFDO1FBS00sZUFBZTtZQUNyQixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUtNLGNBQWMsQ0FBQyxXQUFvQztZQUN6RCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxlQUFlLENBQUMsU0FBb0IsRUFBRSxXQUF5QjtZQUNyRSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUM7WUFDL0MsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQztZQUMvRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ3hELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUtTLGVBQWUsQ0FBQyxPQUFnQjtZQUN6QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxRQUFpQjtZQUM1QyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFLUyxtQkFBbUI7WUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDMUMsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDOUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7YUFDbkI7WUFFRCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFNUyxtQkFBbUI7WUFDNUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7YUFDcEQ7UUFDRixDQUFDOztJQTFRRiw0QkEyUUM7SUF6UWUsY0FBSSxHQUFHLENBQUMsQ0FBQyJ9