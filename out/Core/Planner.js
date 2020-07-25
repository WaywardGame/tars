define(["require", "exports", "utilities/Log", "../Context", "../IObjective", "../Utilities/Logger", "./Plan"], function (require, exports, Log_1, Context_1, IObjective_1, Logger_1, Plan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Planner {
        constructor(debug = false) {
            this.debug = debug;
            this.calculateDifficultyCache = new Map();
            this.calculatingDifficultyDepth = 0;
            this._log = Logger_1.createLog("Planner");
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
            const objectives = result.objectiveChain.map(o => ({ ...o })).slice(1);
            return new Plan_1.default(this, context, objective, objectives);
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
                const objectivePipeline = await this.getObjectivePipeline(clonedContext, objectivesSet);
                if (this.debug) {
                    this.writeCalculationLog(`Returned "${objectivePipeline.status}" for ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}`);
                }
                switch (objectivePipeline.status) {
                    case IObjective_1.CalculatedDifficultyStatus.Impossible:
                        this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: Impossible.`);
                        if (objectivePipeline.changes && objectivePipeline.changes.includeHashCode) {
                            includeHashCode = true;
                        }
                        break;
                    case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                        this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: NotCalculatedYet.`);
                        if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                            result = objectivePipeline;
                        }
                        else if (this.debug) {
                            this.writeCalculationLog("Not setting result");
                        }
                        break;
                    case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                        this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: NotPlausible. Difficulty: ${objectivePipeline.minimumDifficulty}.`);
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
                        this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: Possible. Difficulty: ${objectivePipeline.difficulty}.`);
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
                return {
                    status: IObjective_1.CalculatedDifficultyStatus.Impossible,
                };
            }
            let difficulty = 0;
            const clonedContext = context.clone(true, true);
            const objectiveChain = [];
            const changes = new Context_1.ContextState(clonedContext.state.depth);
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
                            this.writeCalculationLog(`Still not plausible. ${calculatedDifficulty.status}`);
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
            const objectiveHashCode = objective.getHashCode(context);
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
                    else {
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
                        pipelineResult = await this.pickEasiestObjectivePipeline(context, executionResult);
                    }
                    else {
                        pipelineResult = await this.getObjectivePipeline(context, executionResult);
                    }
                    if (pipelineResult.changes) {
                        context.merge(pipelineResult.changes);
                    }
                    if (pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.Impossible ||
                        pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet ||
                        pipelineResult.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                        if (this.debug) {
                            this.writeCalculationLog(`Pipeline returned ${pipelineResult.status}.`);
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
                this.writeCalculationLog(`Set "${cacheHashCode}" to ${result.status}.`);
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
                this.log.info(logString);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db3JlL1BsYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBc0JBLE1BQU0sT0FBTztRQVlaLFlBQTZCLFFBQVEsS0FBSztZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFQekIsNkJBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7WUFFekUsK0JBQTBCLEdBQUcsQ0FBQyxDQUFDO1lBTXRDLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFPLENBQUM7UUFDbkUsQ0FBQztRQUtELElBQVcsY0FBYztZQUN4QixPQUFPLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUtNLEtBQUs7WUFDWCxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQVFNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUM5RCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsMEJBQTBCLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2xHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFHRCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztZQUlwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLENB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