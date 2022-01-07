define(["require", "exports", "utilities/Log", "../context/ContextState", "../objective/IObjective", "../../utilities/Logger", "./Plan", "../objective/Objective"], function (require, exports, Log_1, ContextState_1, IObjective_1, Logger_1, Plan_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Planner {
        constructor(debug = false) {
            this.debug = debug;
            this.calculateDifficultyCache = new Map();
            this.calculatingDifficultyDepth = 0;
            this._log = Logger_1.loggerUtilities.createLog("Planner");
        }
        get log() {
            return this.calculatingDifficultyDepth <= 1 ? this._log : Log_1.nullLog;
        }
        get isCreatingPlan() {
            return this.calculatingDifficultyDepth !== 0;
        }
        reset() {
            this.calculateDifficultyCache.clear();
        }
        async createPlan(context, objective) {
            if (this.isCreatingPlan) {
                this._log.error(`Invalid difficulty depth ${this.calculatingDifficultyDepth}. Resetting to 0...`);
                this.calculatingDifficultyDepth = 0;
            }
            context.state.minimumAcceptedDifficulty = undefined;
            const result = await this.calculateDifficulty(context.clone(true, false), objective);
            if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible ||
                result.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet ||
                result.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                return undefined;
            }
            const objectiveInfo = result.objectiveChain[0];
            const objectives = result.objectiveChain.map(o => ({ ...o })).slice(1);
            return new Plan_1.default(this, context, objectiveInfo, objectives);
        }
        async pickEasiestObjectivePipeline(context, objectives) {
            var _a;
            const start = performance.now();
            let easiestObjectivePipeline;
            this.log.info(`Determining easiest objective. ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
            if (this.debug) {
                this.writeCalculationLog(`Determining easiest objective. ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
            }
            let result = {
                status: IObjective_1.CalculatedDifficultyStatus.Impossible,
            };
            if (objectives.length === 0) {
                return result;
            }
            const clonedContext = context.clone(true);
            let includeHashCode = false;
            let calculateObjectives = true;
            while (calculateObjectives) {
                calculateObjectives = false;
                for (const objectivesSet of objectives) {
                    const objectiveStartTime = performance.now();
                    const objectivePipeline = await this.getObjectivePipeline(clonedContext, objectivesSet);
                    const objectiveDeltaTime = performance.now() - objectiveStartTime;
                    if (this.debug) {
                        this.writeCalculationLog(`Returned "${IObjective_1.CalculatedDifficultyStatus[objectivePipeline.status]}" for ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                    }
                    switch (objectivePipeline.status) {
                        case IObjective_1.CalculatedDifficultyStatus.Impossible:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: Impossible. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            if ((_a = objectivePipeline.changes) === null || _a === void 0 ? void 0 : _a.includeHashCode) {
                                includeHashCode = true;
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: NotCalculatedYet. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                                result = objectivePipeline;
                            }
                            else if (this.debug) {
                                this.writeCalculationLog("Not setting result");
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: NotPlausible. Difficulty: ${objectivePipeline.minimumDifficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            if (result.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                                if (result.minimumDifficulty > objectivePipeline.minimumDifficulty) {
                                    result = objectivePipeline;
                                }
                                else if (this.debug) {
                                    this.writeCalculationLog("Not setting result");
                                }
                            }
                            else if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                                result = objectivePipeline;
                            }
                            else if (this.debug) {
                                this.writeCalculationLog("Not setting result");
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.Possible:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: Possible. Difficulty: ${objectivePipeline.difficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            if (easiestObjectivePipeline === undefined || easiestObjectivePipeline.difficulty > objectivePipeline.difficulty) {
                                easiestObjectivePipeline = objectivePipeline;
                                clonedContext.state.minimumAcceptedDifficulty = objectivePipeline.difficulty;
                                if (this.debug) {
                                    this.writeCalculationLog(`Set minimumAcceptedDifficulty to "${objectivePipeline.difficulty}"`);
                                }
                            }
                            else if (this.debug) {
                                this.writeCalculationLog(`Not the easiest objective. "${easiestObjectivePipeline.difficulty} > ${objectivePipeline.difficulty}"`);
                            }
                            break;
                    }
                }
            }
            const time = performance.now() - start;
            if (this.debug) {
                this.writeCalculationLog(`Took ${time.toFixed(2)}ms`);
            }
            if (easiestObjectivePipeline) {
                this.log.info(`Easiest objective for ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} is ${easiestObjectivePipeline.objectives.map(o => o.getHashCode()).join(" -> ")} (difficulty: ${easiestObjectivePipeline.difficulty}) (time: ${time.toFixed(2)}ms)`);
                if (time >= 1000) {
                    this._log.warn(`Took ${time.toFixed(2)}ms to determine the easiest objective. ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} (context: ${clonedContext.getHashCode()})`);
                    if (time >= 2000) {
                        if (this.debug) {
                            this._log.warn(this.calculationLog.join(""));
                        }
                    }
                }
                if (includeHashCode) {
                    easiestObjectivePipeline.changes.includeHashCode = includeHashCode;
                }
                return easiestObjectivePipeline;
            }
            this.log.info(`All ${objectives.length} objectives are impossible (time: ${time.toFixed(2)}ms)`);
            return result;
        }
        async getObjectivePipeline(context, objectives) {
            if (objectives.length === 0) {
                if (this.debug) {
                    this.writeCalculationLog("No objectives returned");
                }
                return {
                    status: IObjective_1.CalculatedDifficultyStatus.Impossible,
                };
            }
            let difficulty = 0;
            const clonedContext = context.clone(true, true);
            const objectiveChain = [];
            const changes = new ContextState_1.default(clonedContext.state.depth);
            for (const objective of objectives) {
                let calculatedDifficulty = await this.calculateDifficulty(clonedContext, objective);
                if (calculatedDifficulty.status === IObjective_1.CalculatedDifficultyStatus.Impossible ||
                    calculatedDifficulty.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet) {
                    return calculatedDifficulty;
                }
                if (calculatedDifficulty.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                    if (!clonedContext.isPlausible(calculatedDifficulty.minimumDifficulty, true)) {
                        if (this.debug) {
                            this.writeCalculationLog(`Still not plausible. (${clonedContext.state.minimumAcceptedDifficulty} < ${calculatedDifficulty.minimumDifficulty})`);
                        }
                        return calculatedDifficulty;
                    }
                    if (this.debug) {
                        this.writeCalculationLog(`Maybe plausible. Removing from cache. (${clonedContext.state.minimumAcceptedDifficulty} >= ${calculatedDifficulty.minimumDifficulty})`);
                    }
                    this.calculateDifficultyCache.delete(calculatedDifficulty.hashCode);
                    calculatedDifficulty = await this.calculateDifficulty(clonedContext, objective);
                    if (calculatedDifficulty.status === IObjective_1.CalculatedDifficultyStatus.Impossible ||
                        calculatedDifficulty.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet ||
                        calculatedDifficulty.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                        if (this.debug) {
                            this.writeCalculationLog(`Still not plausible. ${IObjective_1.CalculatedDifficultyStatus[calculatedDifficulty.status]}`);
                        }
                        return calculatedDifficulty;
                    }
                }
                difficulty += calculatedDifficulty.difficulty;
                changes.merge(calculatedDifficulty.changes);
                if (!clonedContext.isPlausible(difficulty)) {
                    if (this.debug) {
                        this.writeCalculationLog(`Not plausible. ${difficulty} > minimumAcceptedDifficulty (${clonedContext.state.minimumAcceptedDifficulty})`);
                    }
                    return {
                        hashCode: "NotPlausible",
                        status: IObjective_1.CalculatedDifficultyStatus.NotPlausible,
                        minimumDifficulty: difficulty,
                    };
                }
                objectiveChain.push(...calculatedDifficulty.objectiveChain.map((o, i) => ({
                    depth: o.depth - calculatedDifficulty.depth + this.calculatingDifficultyDepth + 1,
                    objective: i === 0 ? objective : o.objective,
                    difficulty: o.difficulty,
                    logs: o.logs,
                })));
            }
            return {
                status: IObjective_1.CalculatedDifficultyStatus.Possible,
                depth: this.calculatingDifficultyDepth,
                changes: changes,
                objectives: objectives,
                objectiveChain: objectiveChain,
                difficulty: difficulty,
            };
        }
        checkAndMergeDifficultyCache(context, hashCode) {
            if (this.debug) {
                this.writeCalculationLog(`Checking difficulty for "${hashCode}" (${context})`);
            }
            const cachedDifficulty = this.calculateDifficultyCache.get(hashCode);
            if (cachedDifficulty === undefined) {
                return undefined;
            }
            switch (cachedDifficulty.status) {
                case IObjective_1.CalculatedDifficultyStatus.Impossible:
                    if (this.debug) {
                        this.writeCalculationLog(`Returning Impossible for "${hashCode}"`);
                    }
                    return cachedDifficulty;
                case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                    if (this.debug) {
                        this.writeCalculationLog(`Returning NotCalculatedYet for "${hashCode}"`);
                    }
                    return cachedDifficulty;
                case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                    if (this.debug) {
                        this.writeCalculationLog(`Returning NotPlausible for "${hashCode}" (${hashCode})`);
                    }
                    return cachedDifficulty;
                case IObjective_1.CalculatedDifficultyStatus.Possible:
                    context.merge(cachedDifficulty.changes);
                    if (this.debug) {
                        this.writeCalculationLog(`Returning cached difficulty ${cachedDifficulty.difficulty} for "${hashCode}" (${hashCode}) (changes: ${cachedDifficulty.changes.getHashCode()}) (depth ${cachedDifficulty.changes.depth}, ${context.state.depth}) (objective chain: ${cachedDifficulty.objectiveChain.map(o => `${o.depth},${o.objective}`).join(", ")})`);
                    }
                    return cachedDifficulty;
            }
        }
        async calculateDifficulty(context, objective) {
            if (this.calculatingDifficultyDepth === 0) {
                this.calculationLog = [];
            }
            const objectiveHashCode = objective.getHashCode();
            let cachedDifficulty = this.checkAndMergeDifficultyCache(context, objectiveHashCode);
            if (cachedDifficulty !== undefined) {
                return cachedDifficulty;
            }
            let cacheHashCode = objectiveHashCode;
            let contextHashCode;
            let includedContextHashCode = false;
            if (objective.canIncludeContextHashCode(context)) {
                contextHashCode = context.getHashCode();
                cachedDifficulty = this.checkAndMergeDifficultyCache(context, `${cacheHashCode}|${contextHashCode}`);
                if (cachedDifficulty !== undefined) {
                    return cachedDifficulty;
                }
                if (objective.shouldIncludeContextHashCode(context)) {
                    includedContextHashCode = true;
                    cacheHashCode += `|${contextHashCode}`;
                }
            }
            if (++this.calculatingDifficultyDepth === 1) {
                Objective_1.default.enableLogging = false;
            }
            const waitingHashCodes = new Set();
            this.calculateDifficultyCache.set(objectiveHashCode, {
                hashCode: cacheHashCode,
                status: IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet,
                waitingHashCodes,
            });
            let difficulty = objective.getDifficulty(context);
            let minimumDifficulty;
            const objectiveInfo = {
                depth: this.calculatingDifficultyDepth,
                objective: objective,
                difficulty: difficulty,
                logs: [],
            };
            const objectiveChain = [objectiveInfo];
            const memoryLog = new Log_1.MemoryLog("MOD", "TARS", objectiveHashCode);
            memoryLog.setArray(objectiveInfo.logs);
            objective.setLogger(memoryLog);
            const changes = context.watchForChanges();
            let executionResult = await objective.execute(context);
            objective.setLogger(undefined);
            if (executionResult !== IObjective_1.ObjectiveResult.Complete &&
                executionResult !== IObjective_1.ObjectiveResult.Pending &&
                executionResult !== IObjective_1.ObjectiveResult.Ignore &&
                executionResult !== IObjective_1.ObjectiveResult.Restart) {
                if (typeof (executionResult) === "number") {
                    if (executionResult === IObjective_1.ObjectiveResult.Impossible) {
                        difficulty = IObjective_1.CalculatedDifficultyStatus.Impossible;
                    }
                    else if (!objective.isDifficultyOverridden()) {
                        difficulty += executionResult;
                    }
                }
                else {
                    let isMultiplePipelines;
                    if (!Array.isArray(executionResult)) {
                        isMultiplePipelines = false;
                        executionResult = [executionResult];
                    }
                    else {
                        isMultiplePipelines = Array.isArray(executionResult[0]);
                    }
                    let pipelineResult;
                    if (isMultiplePipelines) {
                        if (this.debug) {
                            this.writeCalculationLog(`Found ${executionResult.length} objective pipelines.`);
                        }
                        pipelineResult = await this.pickEasiestObjectivePipeline(context, executionResult);
                    }
                    else {
                        if (this.debug) {
                            this.writeCalculationLog(`Found objective pipeline with ${executionResult.length} objectives.`);
                        }
                        pipelineResult = await this.getObjectivePipeline(context, executionResult);
                    }
                    if (pipelineResult.changes) {
                        context.merge(pipelineResult.changes);
                    }
                    if (pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.Impossible ||
                        pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet ||
                        pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                        if (this.debug) {
                            this.writeCalculationLog(`Pipeline returned ${IObjective_1.CalculatedDifficultyStatus[pipelineResult.status]}.`);
                        }
                        difficulty = pipelineResult.status;
                        if (pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet) {
                            if (this.debug) {
                                this.writeCalculationLog(`Adding ${objectiveHashCode} to waiting hash codes for ${pipelineResult.hashCode} (${Array.from(pipelineResult.waitingHashCodes).join(", ")})`);
                            }
                            pipelineResult.waitingHashCodes.add(objectiveHashCode);
                            waitingHashCodes.addFrom(pipelineResult.waitingHashCodes);
                        }
                        else if (pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                            minimumDifficulty = pipelineResult.minimumDifficulty;
                        }
                    }
                    else {
                        if (this.debug) {
                            this.writeCalculationLog(`Pipeline difficulty: ${pipelineResult.difficulty}. Going to merge "${context.getHashCode()}" (depth: ${context.state.depth}) (objective chain: ${objectiveChain.map(o => `${o.depth},${o.objective}`).join(", ")}) with "${pipelineResult.changes.getHashCode()}" (depth ${pipelineResult.changes.depth}) (objective chain: ${pipelineResult.objectiveChain.map(o => `${o.depth},${o.objective}`).join(", ")})`);
                        }
                        difficulty += pipelineResult.difficulty;
                        const depth = pipelineResult.depth;
                        objectiveChain.push(...pipelineResult.objectiveChain.map(o => ({
                            depth: o.depth - depth + this.calculatingDifficultyDepth,
                            objective: o.objective,
                            difficulty: o.difficulty,
                            logs: o.logs,
                        })));
                    }
                }
            }
            context.unwatch();
            this.calculateDifficultyCache.delete(objectiveHashCode);
            let result;
            objectiveInfo.difficulty = difficulty;
            if (includedContextHashCode && !changes.shouldIncludeHashCode) {
                includedContextHashCode = false;
                cacheHashCode = objectiveHashCode;
                if (this.debug) {
                    this.writeCalculationLog("No need to include the hash code");
                }
            }
            switch (difficulty) {
                case IObjective_1.CalculatedDifficultyStatus.Impossible:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.Impossible,
                        changes: changes,
                    };
                    break;
                case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet,
                        hashCode: cacheHashCode,
                        changes: changes,
                        waitingHashCodes: new Set(waitingHashCodes),
                    };
                    break;
                case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.NotPlausible,
                        hashCode: cacheHashCode,
                        changes: changes,
                        minimumDifficulty: minimumDifficulty,
                    };
                    break;
                default:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.Possible,
                        changes: changes,
                        difficulty: difficulty,
                        depth: this.calculatingDifficultyDepth,
                        objectives: [objective],
                        objectiveChain: objectiveChain,
                    };
                    if (!includedContextHashCode && contextHashCode !== undefined && changes.shouldIncludeHashCode) {
                        this.calculateDifficultyCache.delete(cacheHashCode);
                        changes.includeHashCode = true;
                        cacheHashCode += `|${contextHashCode}`;
                        if (this.debug) {
                            this.writeCalculationLog(`Changes detected. Going to include context hash code for "${cacheHashCode}" (context hash code: ${contextHashCode})`);
                        }
                    }
                    if (this.debug) {
                        this.writeCalculationLog(`Set "${cacheHashCode}" to ${difficulty}. changes: ${changes.getHashCode()} (depth: ${changes.depth})`);
                    }
                    break;
            }
            this.calculateDifficultyCache.set(cacheHashCode, result);
            if (waitingHashCodes.size > 0) {
                if (this.debug) {
                    this.writeCalculationLog(`Waiting hash codes: ${Array.from(waitingHashCodes).join(", ")}`);
                }
                let clearWaitingHashCodes = false;
                if (result.status !== IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet) {
                    clearWaitingHashCodes = true;
                }
                else if (waitingHashCodes.has(objectiveHashCode)) {
                    clearWaitingHashCodes = true;
                    if (this.debug) {
                        this.writeCalculationLog(`Waiting hash codes loop! (${objectiveHashCode})`);
                    }
                }
                if (clearWaitingHashCodes) {
                    if (this.debug) {
                        this.writeCalculationLog(`Clearing waiting hash codes: ${Array.from(waitingHashCodes).join(", ")}`);
                    }
                    for (const waitingHashCode of waitingHashCodes) {
                        this.calculateDifficultyCache.delete(waitingHashCode);
                    }
                    waitingHashCodes.clear();
                    if (this.calculatingDifficultyDepth === 1) {
                    }
                }
            }
            if (--this.calculatingDifficultyDepth === 0) {
                Objective_1.default.enableLogging = true;
            }
            if (this.debug) {
                this.writeCalculationLog(`Set "${cacheHashCode}" to ${IObjective_1.CalculatedDifficultyStatus[result.status]}. Difficulty is ${difficulty}`);
            }
            if (this.calculatingDifficultyDepth === 0 && this.debug) {
                const logString = this.calculationLog.join("");
                this.log.debug(logString);
            }
            return result;
        }
        writeCalculationLog(message) {
            this.calculationLog.push(`${"\t".repeat(this.calculatingDifficultyDepth)}${message}\n`);
        }
    }
    const planner = new Planner(false);
    exports.default = planner;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMEJBLE1BQU0sT0FBTztRQVlaLFlBQW1CLFFBQVEsS0FBSztZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFQZiw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUV6RSwrQkFBMEIsR0FBRyxDQUFDLENBQUM7WUFNdEMsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFPLENBQUM7UUFDbkUsQ0FBQztRQUtELElBQVcsY0FBYztZQUN4QixPQUFPLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUtNLEtBQUs7WUFDWCxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQVFNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUM5RCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsMEJBQTBCLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2xHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFHRCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztZQUlwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxL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