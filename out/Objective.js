var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/Log", "./IObjective", "./Utilities/Action"], function (require, exports, Enums_1, Log_1, IObjective_1, Action_1) {
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
                let easiestObjective;
                let easiestDifficulty;
                for (const objectives of objectiveSets) {
                    const objectiveDifficulty = yield this.calculateObjectiveDifficulties(base, inventory, objectives);
                    this.log.info(`Objective ${objectives.map(o => o.getHashCode()).join(",")}. Difficulty: ${objectiveDifficulty}`);
                    if (objectiveDifficulty < IObjective_1.missionImpossible && (easiestDifficulty === undefined || easiestDifficulty > objectiveDifficulty)) {
                        easiestDifficulty = objectiveDifficulty;
                        easiestObjective = objectives[0];
                    }
                }
                if (easiestObjective) {
                    this.log.info(`Easiest objective is ${easiestObjective.getHashCode()}`);
                }
                else {
                    this.log.info(`All ${objectiveSets.length} objectives are impossible`);
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
                yield Action_1.executeAction(actionType, executeArgument);
                const newItems = localPlayer.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);
                return newItems.find(item => itemTypes.indexOf(item.type) !== -1);
            });
        }
    }
    exports.default = Objective;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQU9BO1FBQUE7WUFHUywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFnS3ZDLENBQUM7UUExSk8sT0FBTyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUNyRCxTQUFTLENBQUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFWSxtQkFBbUIsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUN2RSxJQUFJLFVBQThCLENBQUM7Z0JBRW5DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUMzQixNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxvQkFBb0IsS0FBSyxTQUFTLEVBQUU7d0JBQ3ZDLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQztxQkFDbEM7b0JBRUQsU0FBUyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxHQUFHLDhCQUFpQixDQUFDO2lCQUMvRDtnQkFFRCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQzdCLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUVyRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztv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