var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "utilities/Log", "./IObjective", "./Utilities/Action"], function (require, exports, IAction_1, Enums_1, Log_1, IObjective_1, Action_1) {
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
        onMove() {
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
                    const objectiveDifficulty = yield this.calculateObjectiveDifficulties(base, inventory, ...objectives);
                    this.log.info(`Objective ${objectives.map(o => o.getHashCode()).join(",")}. Difficulty: ${objectiveDifficulty}`);
                    if (objectiveDifficulty < IObjective_1.missionImpossible && (easiestDifficulty === undefined || easiestDifficulty > objectiveDifficulty)) {
                        easiestDifficulty = objectiveDifficulty;
                        easiestObjective = objectives[0];
                    }
                }
                if (easiestObjective) {
                    this.log.info(`Easiest objective is ${easiestObjective.getHashCode()} (difficulty: ${easiestDifficulty})`);
                }
                else {
                    this.log.info(`All ${objectiveSets.length} objectives are impossible`);
                }
                return easiestObjective;
            });
        }
        calculateObjectiveDifficulties(base, inventory, ...objectives) {
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
        executeActionForItem(actionType, executor, itemTypes) {
            return __awaiter(this, void 0, void 0, function* () {
                let matchingNewItem = yield this.executeActionCompareInventoryItems(actionType, executor, itemTypes);
                if (matchingNewItem !== undefined) {
                    this.log.info(`Acquired matching item ${Enums_1.ItemType[matchingNewItem.type]}`);
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const tile = localPlayer.getTile();
                if (tile && tile.containedItems !== undefined && tile.containedItems.find((item) => itemTypes.indexOf(item.type) !== -1)) {
                    matchingNewItem = yield this.executeActionCompareInventoryItems(IAction_1.ActionType.Idle, ((action) => action.execute(localPlayer)), itemTypes);
                    if (matchingNewItem !== undefined) {
                        this.log.info(`Acquired matching item ${Enums_1.ItemType[matchingNewItem.type]} (via idle)`);
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                }
            });
        }
        executeActionCompareInventoryItems(actionType, executor, itemTypes) {
            return __awaiter(this, void 0, void 0, function* () {
                const itemsBefore = localPlayer.inventory.containedItems.slice(0);
                yield Action_1.executeAction(actionType, executor);
                const newItems = localPlayer.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);
                return newItems.find(item => itemTypes.indexOf(item.type) !== -1);
            });
        }
    }
    exports.default = Objective;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09iamVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVNBLE1BQThCLFNBQVM7UUFBdkM7WUFHUywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUE2SnZDLENBQUM7UUF2Sk8sT0FBTyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUNyRCxTQUFTLENBQUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFWSxtQkFBbUIsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUN2RSxJQUFJLFVBQThCLENBQUM7Z0JBRW5DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUMzQixNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxvQkFBb0IsS0FBSyxTQUFTLEVBQUU7d0JBQ3ZDLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQztxQkFDbEM7b0JBRUQsU0FBUyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxHQUFHLDhCQUFpQixDQUFDO2lCQUMvRDtnQkFFRCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQzdCLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUVyRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLHFCQUFxQixHQUFH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