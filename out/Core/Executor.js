define(["require", "exports", "game/entity/player/IPlayer", "../Utilities/Logger", "./IPlan", "./Planner"], function (require, exports, IPlayer_1, Logger_1, IPlan_1, Planner_1) {
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
                    Logger_1.log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`);
                }
                let objs;
                if (Array.isArray(objective)) {
                    objs = objective;
                }
                else {
                    objs = [objective];
                }
                Planner_1.default.reset();
                for (const o of objs) {
                    const plan = this.lastPlan = await Planner_1.default.createPlan(context, o);
                    if (!plan) {
                        Logger_1.log.info(`No valid plan for ${o.getHashCode()}`);
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
                    switch (result.type) {
                        case IPlan_1.ExecuteResultType.Completed:
                            break;
                        case IPlan_1.ExecuteResultType.Pending:
                            return {
                                type: ExecuteObjectivesResultType.Pending,
                                objectives: result.objectives.concat(objectives.slice(i + 1)),
                            };
                        case IPlan_1.ExecuteResultType.ContinuingNextTick:
                            return {
                                type: ExecuteObjectivesResultType.ContinuingNextTick,
                                objectives: result.objectives.concat(objectives.slice(i + 1)),
                            };
                        case IPlan_1.ExecuteResultType.Restart:
                            return {
                                type: ExecuteObjectivesResultType.Restart,
                            };
                    }
                    this.lastPlan = undefined;
                }
            }
            return {
                type: ExecuteObjectivesResultType.Completed,
            };
        }
    }
    const executor = new Executor();
    exports.default = executor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQ29yZS9FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBU0EsSUFBWSwyQkFLWDtJQUxELFdBQVksMkJBQTJCO1FBQ3RDLHVGQUFTLENBQUE7UUFDVCxtRkFBTyxDQUFBO1FBQ1AseUdBQWtCLENBQUE7UUFDbEIsbUZBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVywyQkFBMkIsR0FBM0IsbUNBQTJCLEtBQTNCLG1DQUEyQixRQUt0QztJQXlCRCxNQUFNLFFBQVE7UUFNYjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTSxPQUFPO1lBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDM0IsQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVNLE9BQU8sQ0FBQyxPQUFnQixFQUFFLGtCQUEyQjtZQUMzRCxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7bUJBQzlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7bUJBQ2xDLENBQUMsT0FBTyxD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