var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/Log", "./Helpers", "./IObjective"], function (require, exports, Enums_1, Log_1, Helpers, IObjective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Objective {
        constructor() {
            this.calculatingDifficulty = false;
        }
        execute(base, inventory) {
            Objective.calculatedDifficulties = {};
            return this.onExecute(base, inventory, false);
        }
        calculateDifficulty(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                let difficulty;
                const hashCode = this.getHashCode();
                if (hashCode !== undefined) {
                    const calculatedDifficulty = Objective.calculatedDifficulties[hashCode];
                    if (calculatedDifficulty !== undefined) {
                        difficulty = calculatedDifficulty;
                    }
                    Objective.calculatedDifficulties[hashCode] = IObjective_1.missionImpossible;
                }
                if (difficulty === undefined) {
                    difficulty = this.getBaseDifficulty(base, inventory);
                    this.calculatingDifficulty = true;
                    const result = yield this.onExecute(base, inventory, true);
                    this.calculatingDifficulty = false;
                    if (result !== undefined) {
                        if (typeof (result) === "number") {
                            if (result !== IObjective_1.ObjectiveStatus.Complete) {
                                difficulty += result;
                            }
                        }
                        else if (result instanceof Objective) {
                            const calculatedDifficulty = yield result.calculateDifficulty(base, inventory);
                            if (isNaN(calculatedDifficulty)) {
                                this.log.info(`Invalid difficulty - ${result.getHashCode()}`);
                            }
                            difficulty += calculatedDifficulty;
                        }
                        else {
                            this.log.info("Unknown difficulty");
                        }
                    }
                }
                if (hashCode !== undefined) {
                    Objective.calculatedDifficulties[hashCode] = difficulty;
                }
                return difficulty;
            });
        }
        getName() {
            return this.constructor.name;
        }
        getHashCode() {
            return this.getName();
        }
        shouldSaveChildObjectives() {
            return true;
        }
        getBaseDifficulty(base, inventory) {
            return 1;
        }
        get log() {
            if (!this.calculatingDifficulty) {
                if (this._log === undefined) {
                    this._log = new Log_1.default("MOD", "TARS", this.getName());
                }
                return this._log;
            }
            return Log_1.nullLog;
        }
        pickEasiestObjective(base, inventory, objectiveSets) {
            return __awaiter(this, void 0, void 0, function* () {
                const len = objectiveSets.length;
                if (len === 0) {
                    return undefined;
                }
                let easiestDifficulty;
                let easiestObjective;
                for (const objectives of objectiveSets) {
                    const objectiveDifficulty = yield this.calculateObjectiveDifficulties(base, inventory, objectives);
                    this.log.info(`Objective ${objectives.map(o => o.getHashCode()).join(",")}. Difficulty: ${objectiveDifficulty}`);
                    if (objectiveDifficulty < IObjective_1.missionImpossible && (easiestDifficulty === undefined || easiestDifficulty > objectiveDifficulty)) {
                        easiestDifficulty = objectiveDifficulty;
                        easiestObjective = objectives[0];
                    }
                }
                if (easiestObjective) {
                    this.log.info(`Easiest objective ${easiestObjective.constructor.name} [${easiestObjective.getHashCode()}]`);
                }
                else {
                    this.log.info("All the objectives are impossible");
                }
                return easiestObjective;
            });
        }
        calculateObjectiveDifficulties(base, inventory, objectives) {
            return __awaiter(this, void 0, void 0, function* () {
                let totalDifficulty = 0;
                for (const objective of objectives) {
                    const difficulty = yield objective.calculateDifficulty(base, inventory);
                    if (difficulty >= IObjective_1.missionImpossible) {
                        return IObjective_1.missionImpossible;
                    }
                    totalDifficulty += difficulty;
                }
                return totalDifficulty;
            });
        }
        executeActionForItem(actionType, executeArgument, itemTypes) {
            return __awaiter(this, void 0, void 0, function* () {
                let matchingNewItem = yield this.executeActionCompareInventoryItems(actionType, executeArgument, itemTypes);
                if (matchingNewItem !== undefined) {
                    this.log.info(`Acquired matching item ${Enums_1.ItemType[matchingNewItem.type]}`);
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const tile = localPlayer.getTile();
                if (tile && tile.containedItems !== undefined && tile.containedItems.find((item) => itemTypes.indexOf(item.type) !== -1)) {
                    console.log("found item!");
                    matchingNewItem = yield this.executeActionCompareInventoryItems(Enums_1.ActionType.Idle, undefined, itemTypes);
                    if (matchingNewItem !== undefined) {
                        console.log("picked up item!");
                        this.log.info(`Acquired matching item ${Enums_1.ItemType[matchingNewItem.type]} (via idle)`);
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    else {
                        console.log("didn't pick up item?");
                    }
                }
            });
        }
        executeActionCompareInventoryItems(actionType, executeArgument, itemTypes) {
            return __awaiter(this, void 0, void 0, function* () {
                const itemsBefore = localPlayer.inventory.containedItems.slice(0);
                yield Helpers.executeAction(actionType, executeArgument);
                const newItems = localPlayer.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);
                return newItems.find(item => itemTypes.indexOf(item.type) !== -1);
            });
        }
    }
    exports.default = Objective;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQU9BO1FBQUE7WUFHUywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFvS3ZDLENBQUM7UUFoS08sT0FBTyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUNyRCxTQUFTLENBQUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFWSxtQkFBbUIsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUN2RSxJQUFJLFVBQThCLENBQUM7Z0JBRW5DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUMzQixNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxvQkFBb0IsS0FBSyxTQUFTLEVBQUU7d0JBQ3ZDLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQztxQkFDbEM7b0JBRUQsU0FBUyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxHQUFHLDhCQUFpQixDQUFDO2lCQUMvRDtnQkFFRCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQzdCLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUVyRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztv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