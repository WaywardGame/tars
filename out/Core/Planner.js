define(["require", "exports", "utilities/Log", "../ContextState", "../IObjective", "../utilities/Logger", "./Plan"], function (require, exports, Log_1, ContextState_1, IObjective_1, Logger_1, Plan_1) {
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
                        if (objectivePipeline.changes && objectivePipeline.changes.includeHashCode) {
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
            this.calculatingDifficultyDepth++;
            const waitingHashCodes = [];
            this.calculateDifficultyCache.set(objectiveHashCode, {
                hashCode: cacheHashCode,
                status: IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet,
                waitingHashCodes: waitingHashCodes,
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
                                this.writeCalculationLog(`Adding ${objectiveHashCode} to waiting hash codes for ${pipelineResult.hashCode} (${pipelineResult.waitingHashCodes.join(", ")})`);
                            }
                            pipelineResult.waitingHashCodes.push(objectiveHashCode);
                            waitingHashCodes.push(...pipelineResult.waitingHashCodes);
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
                        waitingHashCodes: [...waitingHashCodes],
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
            if (this.debug) {
                this.writeCalculationLog(`Set "${cacheHashCode}" to ${IObjective_1.CalculatedDifficultyStatus[result.status]}.`);
            }
            if (waitingHashCodes.length > 0) {
                if (this.debug) {
                    this.writeCalculationLog(`Waiting hash codes: ${waitingHashCodes.join(", ")}`);
                }
                let clearWaitingHashCodes = false;
                if (result.status !== IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet) {
                    clearWaitingHashCodes = true;
                }
                else if (waitingHashCodes.includes(objectiveHashCode)) {
                    clearWaitingHashCodes = true;
                    if (this.debug) {
                        this.writeCalculationLog(`Waiting hash codes loop! (${objectiveHashCode})`);
                    }
                }
                if (clearWaitingHashCodes) {
                    if (this.debug) {
                        this.writeCalculationLog(`Clearing waiting hash codes: ${waitingHashCodes.join(", ")}`);
                    }
                    for (const waitingHashCode of waitingHashCodes) {
                        this.calculateDifficultyCache.delete(waitingHashCode);
                    }
                    waitingHashCodes.length = 0;
                }
            }
            this.calculatingDifficultyDepth--;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL1BsYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBdUJBLE1BQU0sT0FBTztRQVlaLFlBQW1CLFFBQVEsS0FBSztZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFQZiw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUV6RSwrQkFBMEIsR0FBRyxDQUFDLENBQUM7WUFNdEMsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFPLENBQUM7UUFDbkUsQ0FBQztRQUtELElBQVcsY0FBYztZQUN4QixPQUFPLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUtNLEtBQUs7WUFDWCxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQVFNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUM5RCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsMEJBQTBCLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2xHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFHRCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztZQUlwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFB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