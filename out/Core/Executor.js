define(["require", "exports", "game/entity/player/IPlayer", "../IContext", "../utilities/Logger", "./IPlan", "./Planner"], function (require, exports, IPlayer_1, IContext_1, Logger_1, IPlan_1, Planner_1) {
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
            return !context.player.isResting()
                && !context.player.isMovingClientside
                && !context.player.hasDelay()
                && !context.player.isGhost()
                && !game.paused
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
                    return {
                        type: ExecuteObjectivesResultType.Pending,
                        objectives: result.objectives.concat(objectives.slice(i + 1)),
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
                        Logger_1.log.info(`No valid plan for ${objective.getHashCode()}`);
                    }
                    break;
                }
                const result = await plan.execute(() => {
                    this.weightChanged = false;
                    return undefined;
                }, (getObjectiveResults) => {
                    if (this.weightChanged && context.player.getWeightStatus() !== IPlayer_1.WeightStatus.None) {
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
                    return {
                        type: ExecuteObjectivesResultType.ContinuingNextTick,
                        objectives: result.objectives.concat(objectives.slice(i + 1)),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBVUEsSUFBWSwyQkFLWDtJQUxELFdBQVksMkJBQTJCO1FBQ3RDLHVGQUFTLENBQUE7UUFDVCxtRkFBTyxDQUFBO1FBQ1AseUdBQWtCLENBQUE7UUFDbEIsbUZBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVywyQkFBMkIsR0FBM0IsbUNBQTJCLEtBQTNCLG1DQUEyQixRQUt0QztJQXlCRCxNQUFNLFFBQVE7UUFNYjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTSxPQUFPO1lBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDM0IsQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVNLE9BQU8sQ0FBQyxPQUFnQixFQUFFLGtCQUEyQjtZQUMzRCxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7bUJBQzlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7bUJBQ2xDLENBQUMsT0FBTyxD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