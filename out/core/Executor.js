/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/entity/IHuman", "game/entity/player/IPlayer", "./context/IContext", "./objective/Objective", "./planning/IPlan"], function (require, exports, IHuman_1, IPlayer_1, IContext_1, Objective_1, IPlan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Executor = exports.ExecuteObjectivesResultType = void 0;
    var ExecuteObjectivesResultType;
    (function (ExecuteObjectivesResultType) {
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["Completed"] = 0] = "Completed";
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["Pending"] = 1] = "Pending";
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["ContinuingNextTick"] = 2] = "ContinuingNextTick";
        ExecuteObjectivesResultType[ExecuteObjectivesResultType["Restart"] = 3] = "Restart";
    })(ExecuteObjectivesResultType || (exports.ExecuteObjectivesResultType = ExecuteObjectivesResultType = {}));
    class Executor {
        constructor(planner) {
            this.planner = planner;
            this.reset();
        }
        getPlan() {
            return this.latestExecutingPlan;
        }
        reset() {
            this.interrupted = false;
            this.weightChanged = false;
            this.latestExecutingPlan = undefined;
            this.planner.reset();
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
            return !context.human.isResting() &&
                context.human.movingClientside !== IHuman_1.MovingClientSide.Moving &&
                !context.human.hasDelay() &&
                !context.human.isGhost() &&
                !game.isPaused &&
                (!checkForInterrupts || !this.interrupted);
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
                    context.log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`, IContext_1.MovingToNewIslandState[moveToNewIslandState]);
                }
                Objective_1.default.reset();
                this.planner.reset();
                const objectiveChain = Array.isArray(objective) ? objective : [objective];
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
                const plan = await this.planner.createPlan(context, objective);
                if (!plan) {
                    if (!objective.ignoreInvalidPlans) {
                        this.latestExecutingPlan = plan;
                        context.log.info(`No valid plan for ${objective.getHashCode(context)}`);
                    }
                    break;
                }
                if (plan.objectives.length > 1) {
                    this.latestExecutingPlan = plan;
                }
                const result = await plan.execute(() => {
                    this.weightChanged = false;
                    return undefined;
                }, (getObjectiveResults) => {
                    if (this.weightChanged && context.human.getWeightStatus() !== IPlayer_1.WeightStatus.None) {
                        context.log.info("Weight changed. Stopping execution");
                        return {
                            type: IPlan_1.ExecuteResultType.Restart,
                        };
                    }
                    const remainingObjectives = getObjectiveResults();
                    if (remainingObjectives.length > 0 && !this.isReady(context, checkForInterrupts)) {
                        return {
                            type: IPlan_1.ExecuteResultType.ContinuingNextTick,
                            objectives: remainingObjectives,
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
                this.latestExecutingPlan = undefined;
            }
            return {
                type: ExecuteObjectivesResultType.Completed,
            };
        }
    }
    exports.Executor = Executor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBY0gsSUFBWSwyQkFLWDtJQUxELFdBQVksMkJBQTJCO1FBQ3RDLHVGQUFTLENBQUE7UUFDVCxtRkFBTyxDQUFBO1FBQ1AseUdBQWtCLENBQUE7UUFDbEIsbUZBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVywyQkFBMkIsMkNBQTNCLDJCQUEyQixRQUt0QztJQXlCRCxNQUFhLFFBQVE7UUFNcEIsWUFBNkIsT0FBaUI7WUFBakIsWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUM3QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRU0sT0FBTztZQUNiLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztZQUVyQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUVNLGlCQUFpQjtZQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFFTSxPQUFPLENBQUMsT0FBZ0IsRUFBRSxrQkFBMkI7WUFDM0QsT0FBTyxD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