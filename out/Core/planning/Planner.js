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
            this.log.info(`Determining easiest objective. ${objectives.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
            if (this.debug) {
                this.writeCalculationLog(`Determining easiest objective. ${objectives.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
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
                        this.writeCalculationLog(`Returned "${IObjective_1.CalculatedDifficultyStatus[objectivePipeline.status]}" for ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}.`);
                    }
                    switch (objectivePipeline.status) {
                        case IObjective_1.CalculatedDifficultyStatus.Impossible:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: Impossible. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            if (objectivePipeline.changes?.includeHashCode) {
                                includeHashCode = true;
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: NotCalculatedYet. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                                result = objectivePipeline;
                            }
                            else if (this.debug) {
                                this.writeCalculationLog("Not setting result");
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: NotPlausible. Difficulty: ${objectivePipeline.minimumDifficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
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
                            this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: Possible. Difficulty: ${objectivePipeline.difficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
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
            if (easiestObjectivePipeline) {
                this.log.info(`Easiest objective for ${objectives.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} is ${easiestObjectivePipeline.objectives.map(o => o.getHashCode(context)).join(" -> ")} (difficulty: ${easiestObjectivePipeline.difficulty}) (time: ${time.toFixed(2)}ms)`);
                if (time >= 1000) {
                    this._log.warn(`Took ${time.toFixed(2)}ms to determine the easiest objective. ${objectives.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} (context: ${clonedContext.getHashCode()})`);
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
            const objectiveHashCode = objective.getHashCode(context);
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