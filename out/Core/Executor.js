define(["require", "exports", "game/entity/player/IPlayer", "../utilities/Logger", "./context/IContext", "./planning/IPlan", "./planning/Planner"], function (require, exports, IPlayer_1, Logger_1, IContext_1, IPlan_1, Planner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExecuteObjectivesResultType = void 0;
    var ExecuteObjectivesResultType;
    (function (ExecuteObjectivesResultType) {
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["Completed"] = 0] = "Completed";
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["Pending"] = 1] = "Pending";
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["ContinuingNextTick"] = 2] = "ContinuingNextTick";
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["Restart"] = 3] = "Restart";
    })(ExecuteObjectivesResultType = exports.ExecuteObjectivesResultType || (exports.ExecuteObjectivesResultType = {}));
    class Executor {
        constructor() {
            this.reset();
        }
        getPlan() {
            return this.lastPlan;
        }
        reset() {
            this.interrupted = false;
            this.weightChanged = false;
            this.lastPlan = undefined;
            Planner_1.default.reset();
        }
        interrupt() {
            this.interrupted = true;
        }
        tryClearInterrupt() {
            if (this.interrupted) {
                this.interrupted = false;
                return true;
            }
            return false;
        }
        markWeightChanged() {
            this.weightChanged = true;
        }
        isReady(context, checkForInterrupts) {
            return !context.human.isResting()
                && !context.human.isMovingClientside
                && !context.human.hasDelay()
                && !context.human.isGhost()
                && !game.isPaused
                && (!checkForInterrupts || !this.interrupted);
        }
        async executeObjectives(context, objectives, resetContextState, checkForInterrupts = false) {
            const length = objectives.length;
            for (let i = 0; i < length; i++) {
                const objective = objectives[i];
                if (!this.isReady(context, checkForInterrupts)) {
                    return {
                        type: ExecuteObjectivesResultType.Restart,
                    };
                }
                if (resetContextState) {
                    context.reset();
                    const moveToNewIslandState = context.getDataOrDefault(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
                    Logger_1.log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`, IContext_1.MovingToNewIslandState[moveToNewIslandState]);
                }
                let objectiveChain;
                if (Array.isArray(objective)) {
                    objectiveChain = objective;
                }
                else {
                    objectiveChain = [objective];
                }
                Planner_1.default.reset();
                const result = await this.executeObjectiveChain(context, objectiveChain, checkForInterrupts);
                if (result.type === ExecuteObjectivesResultType.Restart) {
                    return result;
                }
                else if (result.type !== ExecuteObjectivesResultType.Completed) {
                    const remainingObjectives = objectives.slice(i + 1);
                    return {
                        type: ExecuteObjectivesResultType.Pending,
                        objectives: result.objectives.concat(remainingObjectives),
                    };
                }
            }
            return {
                type: ExecuteObjectivesResultType.Completed,
            };
        }
        async executeObjectiveChain(context, objectives, checkForInterrupts) {
            for (let i = 0; i < objectives.length; i++) {
                const objective = objectives[i];
                const plan = this.lastPlan = await Planner_1.default.createPlan(context, objective);
                if (!plan) {
                    if (!objective.ignoreInvalidPlans) {
                        Logger_1.log.info(`No valid plan for ${objective.getHashCode(context)}`);
                    }
                    break;
                }
                const result = await plan.execute(() => {
                    this.weightChanged = false;
                    return undefined;
                }, (getObjectiveResults) => {
                    if (this.weightChanged && context.human.getWeightStatus() !== IPlayer_1.WeightStatus.None) {
                        Logger_1.log.info("Weight changed. Stopping execution");
                        return {
                            type: IPlan_1.ExecuteResultType.Restart,
                        };
                    }
                    if (!this.isReady(context, checkForInterrupts)) {
                        return {
                            type: IPlan_1.ExecuteResultType.ContinuingNextTick,
                            objectives: getObjectiveResults(),
                        };
                    }
                    return undefined;
                });
                if (result.type === IPlan_1.ExecuteResultType.Restart) {
                    return {
                        type: ExecuteObjectivesResultType.Restart,
                    };
                }
                else if (result.type === IPlan_1.ExecuteResultType.Ignored) {
                    return {
                        type: ExecuteObjectivesResultType.Completed,
                    };
                }
                else if (result.type !== IPlan_1.ExecuteResultType.Completed) {
                    const remainingObjectives = objectives.slice(i + 1);
                    return {
                        type: ExecuteObjectivesResultType.ContinuingNextTick,
                        objectives: result.objectives.concat(remainingObjectives),
                    };
                }
                this.lastPlan = undefined;
            }
            return {
                type: ExecuteObjectivesResultType.Completed,
            };
        }
    }
    const executor = new Executor();
    exports.default = executor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBV0EsSUFBWSwyQkFLWDtJQUxELFdBQVksMkJBQTJCO1FBQ3RDLHVGQUFTLENBQUE7UUFDVCxtRkFBTyxDQUFBO1FBQ1AseUdBQWtCLENBQUE7UUFDbEIsbUZBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVywyQkFBMkIsR0FBM0IsbUNBQTJCLEtBQTNCLG1DQUEyQixRQUt0QztJQXlCRCxNQUFNLFFBQVE7UUFNYjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTSxPQUFPO1lBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFFMUIsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRU0sU0FBUztZQUNmLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztnQkFDekIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLGlCQUFpQjtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRU0sT0FBTyxDQUFDLE9BQWdCLEVBQUUsa0JBQTJCO1lBQzNELE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTttQkFDN0IsQ0FBQyxPQUFPLENBQUMsS0FB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