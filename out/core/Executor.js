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
define(["require", "exports", "@wayward/game/game/entity/IHuman", "@wayward/game/game/entity/player/IPlayer", "./context/IContext", "./objective/Objective", "./planning/IPlan"], function (require, exports, IHuman_1, IPlayer_1, IContext_1, Objective_1, IPlan_1) {
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
            return !context.human.isResting &&
                context.human.movingData.state !== IHuman_1.MovingState.Moving &&
                !context.human.hasDelay() &&
                !context.human.isGhost &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBY0gsSUFBWSwyQkFLWDtJQUxELFdBQVksMkJBQTJCO1FBQ3RDLHVGQUFTLENBQUE7UUFDVCxtRkFBTyxDQUFBO1FBQ1AseUdBQWtCLENBQUE7UUFDbEIsbUZBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVywyQkFBMkIsMkNBQTNCLDJCQUEyQixRQUt0QztJQXlCRCxNQUFhLFFBQVE7UUFNcEIsWUFBNkIsT0FBaUI7WUFBakIsWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUM3QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRU0sT0FBTztZQUNiLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztZQUVyQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUVNLGlCQUFpQjtZQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLGlCQUFpQjtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRU0sT0FBTyxDQUFDLE9BQWdCLEVBQUUsa0JBQTJCO1lB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