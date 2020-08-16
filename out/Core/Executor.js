define(["require", "exports", "entity/player/IPlayer", "../Utilities/Logger", "./IPlan", "./Planner"], function (require, exports, IPlayer_1, Logger_1, IPlan_1, Planner_1) {
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
        reset() {
            this.interrupted = false;
            this.weightChanged = false;
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
                    const plan = await Planner_1.default.createPlan(context, o);
                    if (!plan) {
                        Logger_1.log.warn(`No valid plan for ${o.getHashCode()}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQ29yZS9FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBU0EsSUFBWSwyQkFLWDtJQUxELFdBQVksMkJBQTJCO1FBQ3RDLHVGQUFTLENBQUE7UUFDVCxtRkFBTyxDQUFBO1FBQ1AseUdBQWtCLENBQUE7UUFDbEIsbUZBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVywyQkFBMkIsR0FBM0IsbUNBQTJCLEtBQTNCLG1DQUEyQixRQUt0QztJQXlCRCxNQUFNLFFBQVE7UUFLYjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVNLE9BQU8sQ0FBQyxPQUFnQixFQUFFLGtCQUEyQjtZQUMzRCxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7bUJBQzlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7bUJBQ2xDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7bUJBQzFCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7bUJBQ3pCLENBQUMsSUFBSSxDQUFDLE1BQU07bUJBQ1osQ0FBQyxDQUFDLGtCQUFrQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFRTSxLQUFLLENBQUMsaUJBQWlCLENBQzdCLE9BQWdCLEVBQ2hCLFVBQTRDLEVBQzVDLGlCQUEwQixFQUMxQixxQkFBOEIsS0FBSztZQUNuQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLEVBQUU7b0JBQy9DLE9BQU87d0JBQ04sSUFBSSxFQUFFLDJCQUEyQixDQUFDLE9BQU87cUJBQ3pDLENBQUM7aUJBQ0Y7Z0JBRUQsSUFBSSxpQkFBaUIsRUFBRTtvQkFFdEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNoQixZQUFHLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUMvRTtnQkFFRCxJQUFJLElBQWtCLENBQUM7Z0JBQ3ZCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxHQUFHLFNBQVMsQ0FBQztpQkFDakI7cUJBQU07b0JBQ04sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ25CO2dCQUVELGlCQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRWhCLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO29CQUNyQixNQUFNLElBQUksR0FBRyxNQUFNLGlCQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVixZQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNqRCxNQUFNO3FCQUNOO29CQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FDaEMsR0FBRyxFQUFFO3dCQUNKLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO3dCQUMzQixPQUFPLFNBQVMsQ0FBQztvQkFDbEIsQ0FBQyxFQUNELENBQUMsbUJBQXVDLEVBQUUsRUFBRTt3QkFDM0MsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssc0JBQVksQ0FBQyxJQUFJLEVBQUU7NEJBQ2pGLFlBQUcsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQzs0QkFDL0MsT0FBTztnQ0FDTixJQUFJLEVBQUUseUJBQWlCLENBQUMsT0FBTzs2QkFDL0IsQ0FBQzt5QkFDRjt3QkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsRUFBRTs0QkFDL0MsT0FBTztnQ0FDTixJQUFJLEVBQUUseUJBQWlCLENBQUMsa0JBQWtCO2dDQUMxQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUU7NkJBQ2pDLENBQUM7eUJBQ0Y7d0JBRUQsT0FBTyxTQUFTLENBQUM7b0JBQ2xCLENBQUMsQ0FBQyxDQUFDO29CQUVKLFFBQVEsTUFBTSxDQUFDLElBQUksRUFBRTt3QkFDcEIsS0FBSyx5QkFBaUIsQ0FBQyxTQUFTOzRCQUUvQixNQUFNO3dCQUVQLEtBQUsseUJBQWlCLENBQUMsT0FBTzs0QkFDN0IsT0FBTztnQ0FDTixJQUFJLEVBQUUsMkJBQTJCLENBQUMsT0FBTztnQ0FDekMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzZCQUM3RCxDQUFDO3dCQUVILEtBQUsseUJBQWlCLENBQUMsa0JBQWtCOzRCQUN4QyxPQUFPO2dDQUNOLElBQUksRUFBRSwyQkFBMkIsQ0FBQyxrQkFBa0I7Z0NBQ3BELFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs2QkFDN0QsQ0FBQzt3QkFFSCxLQUFLLHlCQUFpQixDQUFDLE9BQU87NEJBQzdCLE9BQU87Z0NBQ04sSUFBSSxFQUFFLDJCQUEyQixDQUFDLE9BQU87NkJBQ3pDLENBQUM7cUJBQ0g7aUJBQ0Q7YUFDRDtZQUVELE9BQU87Z0JBQ04sSUFBSSxFQUFFLDJCQUEyQixDQUFDLFNBQVM7YUFDM0MsQ0FBQztRQUNILENBQUM7S0FFRDtJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7SUFFaEMsa0JBQWUsUUFBUSxDQUFDIn0=