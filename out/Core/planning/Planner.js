define(["require", "exports", "utilities/Log", "../context/ContextState", "../objective/IObjective", "../../utilities/Logger", "./Plan"], function (require, exports, Log_1, ContextState_1, IObjective_1, Logger_1, Plan_1) {
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
                            if (objectivePipeline.changes?.includeHashCode) {
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
            const changesToMerge = [];
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
                changesToMerge.push(calculatedDifficulty.changes);
                objectiveChain.push(...calculatedDifficulty.objectiveChain.map((o, i) => ({
                    depth: o.depth - calculatedDifficulty.depth + this.calculatingDifficultyDepth + 1,
                    objective: i === 0 ? objective : o.objective,
                    difficulty: o.difficulty,
                    logs: o.logs,
                })));
            }
            const changes = new ContextState_1.default(clonedContext.state.depth);
            for (const contextState of changesToMerge) {
                changes.merge(contextState);
            }
            return {
                status: IObjective_1.CalculatedDifficultyStatus.Possible,
                depth: this.calculatingDifficultyDepth,
                changes,
                objectives,
                objectiveChain,
                difficulty,
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
            const canIncludeContextHashCode = objective.canIncludeContextHashCode(context);
            if (canIncludeContextHashCode !== false) {
                contextHashCode = canIncludeContextHashCode !== true ? context.getFilteredHashCode(canIncludeContextHashCode) : context.getHashCode();
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
            this.calculatingDifficultyDepth--;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQU0sT0FBTztRQVlaLFlBQW1CLFFBQVEsS0FBSztZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFQZiw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUV6RSwrQkFBMEIsR0FBRyxDQUFDLENBQUM7WUFNdEMsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFPLENBQUM7UUFDbkUsQ0FBQztRQUtELElBQVcsY0FBYztZQUN4QixPQUFPLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUtNLEtBQUs7WUFDWCxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQVFNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUM5RCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsMEJBQTBCLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2xHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFHRCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztZQUlwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxL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