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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL1BsYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBdUJBLE1BQU0sT0FBTztRQVlaLFlBQW1CLFFBQVEsS0FBSztZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFQZiw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUV6RSwrQkFBMEIsR0FBRyxDQUFDLENBQUM7WUFNdEMsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFPLENBQUM7UUFDbkUsQ0FBQztRQUtELElBQVcsY0FBYztZQUN4QixPQUFPLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUtNLEtBQUs7WUFDWCxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQVFNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUM5RCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsMEJBQTBCLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2xHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFHRCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztZQUlwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVyRixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsVUFBVTtnQkFDMUQsTUFBTSxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxnQkFBZ0I7Z0JBQzdELE1BQU0sQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsWUFBWSxFQUFFO2dCQUMzRCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUdELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQXFCLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV6RixPQUFPLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFRTSxLQUFLLENBQUMsNEJBQTRCLENBQUMsT0FBZ0IsRUFBRSxVQUEwQjtZQUNyRixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFaEMsSUFBSSx3QkFBK0QsQ0FBQztZQUVwRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsT0FBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVwSyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtDQUFrQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQy9LO1lBRUQsSUFBSSxNQUFNLEdBQXNCO2dCQUMvQixNQUFNLEVBQUUsdUNBQTBCLENBQUMsVUFBVTthQUM3QyxDQUFDO1lBRUYsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUMsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBRTVCLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBRS9CLE9BQU8sbUJBQW1CLEVBQUU7Z0JBQzNCLG1CQUFtQixHQUFHLEtBQUssQ0FBQztnQkFFNUIsS0FBSyxNQUFNLGFBQWEsSUFBSSxVQUFVLEVBQUU7b0JBQ3ZDLE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUM3QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDeEYsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsa0JBQWtCLENBQUM7b0JBRWxFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSx1Q0FBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ3ZNO29CQUVELFFBQVEsaUJBQWlCLENBQUMsTUFBTSxFQUFFO3dCQUNqQyxLQUFLLHVDQUEwQixDQUFDLFVBQVU7NEJBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRW5KLElBQUksaUJBQWlCLENBQUMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7Z0NBRzNFLGVBQWUsR0FBRyxJQUFJLENBQUM7NkJBQ3ZCOzRCQUVELE1BQU07d0JBRVAsS0FBSyx1Q0FBMEIsQ0FBQyxnQkFBZ0I7NEJBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsc0NBQXNDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBUXpKLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxVQUFVLEVBQUU7Z0NBQzVELE1BQU0sR0FBRyxpQkFBaUIsQ0FBQzs2QkFFM0I7aUNBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dDQUN0QixJQUFJLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs2QkFDL0M7NEJBRUQsTUFBTTt3QkFFUCxLQUFLLHVDQUEwQixDQUFDLFlBQVk7NEJBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsdUNBQXVDLGlCQUFpQixDQUFDLGlCQUFpQixZQUFZLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRXpNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxZQUFZLEVBQUU7Z0NBQzlELElBQUksTUFBTSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixFQUFFO29DQUVuRSxNQUFNLEdBQUcsaUJBQWlCLENBQUM7aUNBRTNCO3FDQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtvQ0FDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixDQUFDLENBQUM7aUNBQy9DOzZCQUVEO2lDQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxVQUFVLEVBQUU7Z0NBQ25FLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQzs2QkFFM0I7aUNBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dDQUN0QixJQUFJLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs2QkFDL0M7NEJBRUQsTUFBTTt3QkFFUCxLQUFLLHVDQUEwQixDQUFDLFFBQVE7NEJBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUNBQW1DLGlCQUFpQixDQUFDLFVBQVUsWUFBWSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUU5TCxJQUFJLHdCQUF3QixLQUFLLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxFQUFFO2dDQUNqSCx3QkFBd0IsR0FBRyxpQkFBaUIsQ0FBQztnQ0FDN0MsYUFBYSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7Z0NBRTdFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtvQ0FDZixJQUFJLENBQUMsbUJBQW1CLENBQUMscUNBQXFDLGlCQUFpQixDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7aUNBQy9GOzZCQUVEO2lDQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQ0FDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLCtCQUErQix3QkFBd0IsQ0FBQyxVQUFVLE1BQU0saUJBQWlCLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQzs2QkFDbEk7NEJBRUQsTUFBTTtxQkFDUDtpQkFDRDthQUNEO1lBRUQsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUV2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLHdCQUF3QixFQUFFO2dCQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sd0JBQXdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLHdCQUF3QixDQUFDLFVBQVUsWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFMVIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO29CQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLDBDQUEwQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxhQUFhLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUUxTSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7d0JBQ2pCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTs0QkFDZixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3lCQUU3QztxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLGVBQWUsRUFBRTtvQkFDcEIsd0JBQXdCLENBQUMsT0FBTyxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7aUJBQ25FO2dCQUVELE9BQU8sd0JBQXdCLENBQUM7YUFDaEM7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLFVBQVUsQ0FBQyxNQUFNLHFDQUFxQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqRyxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBZ0IsRUFBRSxVQUF3QjtZQUM1RSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixDQUFDLENBQUM7aUJBQ25EO2dCQUVELE9BQU87b0JBQ04sTUFBTSxFQUFFLHVDQUEwQixDQUFDLFVBQVU7aUJBQzdDLENBQUM7YUFDRjtZQUVELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztZQUVuQixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVoRCxNQUFNLGNBQWMsR0FBcUIsRUFBRSxDQUFDO1lBRTVDLE1BQU0sT0FBTyxHQUFHLElBQUksc0JBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBTTVELEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO2dCQUNuQyxJQUFJLG9CQUFvQixHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFJcEYsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsVUFBVTtvQkFDeEUsb0JBQW9CLENBQUMsTUFBTSxLQUFLLHVDQUEwQixDQUFDLGdCQUFnQixFQUFFO29CQUM3RSxPQUFPLG9CQUFvQixDQUFDO2lCQUM1QjtnQkFFRCxJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxZQUFZLEVBQUU7b0JBSTVFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUM3RSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7NEJBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHlCQUF5QixhQUFhLENBQUMsS0FBSyxDQUFDLHlCQUF5QixNQUFNLG9CQUFvQixDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQzt5QkFDaEo7d0JBRUQsT0FBTyxvQkFBb0IsQ0FBQztxQkFDNUI7b0JBR0QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQywwQ0FBMEMsYUFBYSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsT0FBTyxvQkFBb0IsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7cUJBQ2xLO29CQUVELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRXBFLG9CQUFvQixHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFJaEYsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsVUFBVTt3QkFDeEUsb0JBQW9CLENBQUMsTUFBTSxLQUFLLHVDQUEwQixDQUFDLGdCQUFnQjt3QkFDM0Usb0JBQW9CLENBQUMsTUFBTSxLQUFLLHVDQUEwQixDQUFDLFlBQVksRUFBRTt3QkFDekUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFOzRCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsdUNBQTBCLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUM1Rzt3QkFFRCxPQUFPLG9CQUFvQixDQUFDO3FCQUM1QjtpQkFDRDtnQkFFRCxVQUFVLElBQUksb0JBQW9CLENBQUMsVUFBVSxDQUFDO2dCQUU5QyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDM0MsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsVUFBVSxpQ0FBaUMsYUFBYSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxDQUFDLENBQUM7cUJBQ3hJO29CQUVELE9BQU87d0JBQ04sUUFBUSxFQUFFLGNBQWM7d0JBQ3hCLE1BQU0sRUFBRSx1Q0FBMEIsQ0FBQyxZQUFZO3dCQUMvQyxpQkFBaUIsRUFBRSxVQUFVO3FCQUM3QixDQUFDO2lCQUNGO2dCQUtELGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDekUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUksb0JBQWtELENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDO29CQUNoSCxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDNUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVO29CQUN4QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7aUJBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNMO1lBRUQsT0FBTztnQkFDTixNQUFNLEVBQUUsdUNBQTBCLENBQUMsUUFBUTtnQkFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQywwQkFBMEI7Z0JBQ3RDLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixVQUFVLEVBQUUsVUFBVTtnQkFDdEIsY0FBYyxFQUFFLGNBQWM7Z0JBQzlCLFVBQVUsRUFBRSxVQUFVO2FBQ3RCLENBQUM7UUFDSCxDQUFDO1FBRU8sNEJBQTRCLENBQUMsT0FBZ0IsRUFBRSxRQUFnQjtZQUN0RSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDRCQUE0QixRQUFRLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQzthQUMvRTtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRSxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtnQkFDbkMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxRQUFRLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtnQkFDaEMsS0FBSyx1Q0FBMEIsQ0FBQyxVQUFVO29CQUN6QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDZCQUE2QixRQUFRLEdBQUcsQ0FBQyxDQUFDO3FCQUNuRTtvQkFFRCxPQUFPLGdCQUFnQixDQUFDO2dCQUV6QixLQUFLLHVDQUEwQixDQUFDLGdCQUFnQjtvQkFDL0MsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxtQ0FBbUMsUUFBUSxHQUFHLENBQUMsQ0FBQztxQkFDekU7b0JBRUQsT0FBTyxnQkFBZ0IsQ0FBQztnQkFFekIsS0FBSyx1Q0FBMEIsQ0FBQyxZQUFZO29CQUMzQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLCtCQUErQixRQUFRLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQztxQkFDbkY7b0JBRUQsT0FBTyxnQkFBZ0IsQ0FBQztnQkFFekIsS0FBSyx1Q0FBMEIsQ0FBQyxRQUFRO29CQUV2QyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUV4QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLCtCQUErQixnQkFBZ0IsQ0FBQyxVQUFVLFNBQVMsUUFBUSxNQUFNLFFBQVEsZUFBZSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFlBQVksZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssdUJBQXVCLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDclY7b0JBRUQsT0FBTyxnQkFBZ0IsQ0FBQzthQUN6QjtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUN4RSxJQUFJLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO2FBQ3pCO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFHbEQsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDckYsSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7Z0JBQ25DLE9BQU8sZ0JBQWdCLENBQUM7YUFDeEI7WUFFRCxJQUFJLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQztZQUN0QyxJQUFJLGVBQW1DLENBQUM7WUFDeEMsSUFBSSx1QkFBdUIsR0FBRyxLQUFLLENBQUM7WUFHcEMsSUFBSSxTQUFTLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2pELGVBQWUsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRXhDLGdCQUFnQixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxhQUFhLElBQUksZUFBZSxFQUFFLENBQUMsQ0FBQztnQkFDckcsSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7b0JBQ25DLE9BQU8sZ0JBQWdCLENBQUM7aUJBQ3hCO2dCQUVELElBQUksU0FBUyxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUVwRCx1QkFBdUIsR0FBRyxJQUFJLENBQUM7b0JBQy9CLGFBQWEsSUFBSSxJQUFJLGVBQWUsRUFBRSxDQUFDO2lCQUN2QzthQUNEO1lBRUQsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFFbEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBRTNDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3BELFFBQVEsRUFBRSxhQUFhO2dCQUN2QixNQUFNLEVBQUUsdUNBQTBCLENBQUMsZ0JBQWdCO2dCQUNuRCxnQkFBZ0I7YUFDaEIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLEdBQVcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxRCxJQUFJLGlCQUFxQyxDQUFDO1lBRTFDLE1BQU0sYUFBYSxHQUFtQjtnQkFDckMsS0FBSyxFQUFFLElBQUksQ0FBQywwQkFBMEI7Z0JBQ3RDLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixVQUFVLEVBQUUsVUFBVTtnQkFDdEIsSUFBSSxFQUFFLEVBQUU7YUFDUixDQUFDO1lBRUYsTUFBTSxjQUFjLEdBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFekQsTUFBTSxTQUFTLEdBQUcsSUFBSSxlQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFL0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRTFDLElBQUksZUFBZSxHQUFHLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV2RCxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRS9CLElBQUksZUFBZSxLQUFLLDRCQUFlLENBQUMsUUFBUTtnQkFDL0MsZUFBZSxLQUFLLDRCQUFlLENBQUMsT0FBTztnQkFDM0MsZUFBZSxLQUFLLDRCQUFlLENBQUMsTUFBTTtnQkFDMUMsZUFBZSxLQUFLLDRCQUFlLENBQUMsT0FBTyxFQUFFO2dCQUM3QyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQzFDLElBQUksZUFBZSxLQUFLLDRCQUFlLENBQUMsVUFBVSxFQUFFO3dCQUNuRCxVQUFVLEdBQUcsdUNBQTBCLENBQUMsVUFBVSxDQUFDO3FCQUVuRDt5QkFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLEVBQUU7d0JBQy9DLFVBQVUsSUFBSSxlQUFlLENBQUM7cUJBQzlCO2lCQUVEO3FCQUFNO29CQUNOLElBQUksbUJBQW1CLENBQUM7b0JBRXhCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFO3dCQUVwQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7d0JBQzVCLGVBQWUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO3FCQUVwQzt5QkFBTTt3QkFDTixtQkFBbUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN4RDtvQkFFRCxJQUFJLGNBQThELENBQUM7b0JBRW5FLElBQUksbUJBQW1CLEVBQUU7d0JBQ3hCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTs0QkFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxlQUFlLENBQUMsTUFBTSx1QkFBdUIsQ0FBQyxDQUFDO3lCQUNqRjt3QkFFRCxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxFQUFFLGVBQWlDLENBQUMsQ0FBQztxQkFFckc7eUJBQU07d0JBQ04sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFOzRCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxpQ0FBaUMsZUFBZSxDQUFDLE1BQU0sY0FBYyxDQUFDLENBQUM7eUJBQ2hHO3dCQUVELGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsZUFBK0IsQ0FBQyxDQUFDO3FCQUMzRjtvQkFFRCxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN0QztvQkFFRCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsVUFBVTt3QkFDbEUsY0FBYyxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxnQkFBZ0I7d0JBQ3JFLGNBQWMsQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsWUFBWSxFQUFFO3dCQUNuRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7NEJBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHFCQUFxQix1Q0FBMEIsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUNwRzt3QkFFRCxVQUFVLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQzt3QkFFbkMsSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLHVDQUEwQixDQUFDLGdCQUFnQixFQUFFOzRCQUMxRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0NBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsaUJBQWlCLDhCQUE4QixjQUFjLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs2QkFDeks7NEJBRUQsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOzRCQUV2RCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7eUJBRTFEOzZCQUFNLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxZQUFZLEVBQUU7NEJBQzdFLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQzt5QkFDckQ7cUJBRUQ7eUJBQU07d0JBQ04sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFOzRCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsY0FBYyxDQUFDLFVBQVUscUJBQXFCLE9BQU8sQ0FBQyxXQUFXLEVBQUUsYUFBYSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssdUJBQXVCLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFlBQVksY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLHVCQUF1QixjQUFjLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUMzYTt3QkFFRCxVQUFVLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQzt3QkFFeEMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQzt3QkFFbkMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDOUQsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQywwQkFBMEI7NEJBQ3hELFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUzs0QkFDdEIsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVOzRCQUN4QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7eUJBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDTDtpQkFDRDthQUNEO1lBRUQsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBR2xCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4RCxJQUFJLE1BQXlCLENBQUM7WUFFOUIsYUFBYSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFFdEMsSUFBSSx1QkFBdUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDOUQsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxhQUFhLEdBQUcsaUJBQWlCLENBQUM7Z0JBRWxDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsa0NBQWtDLENBQUMsQ0FBQztpQkFDN0Q7YUFDRDtZQUdELFFBQVEsVUFBVSxFQUFFO2dCQUNuQixLQUFLLHVDQUEwQixDQUFDLFVBQVU7b0JBQ3pDLE1BQU0sR0FBRzt3QkFDUixNQUFNLEVBQUUsdUNBQTBCLENBQUMsVUFBVTt3QkFDN0MsT0FBTyxFQUFFLE9BQU87cUJBQ2hCLENBQUM7b0JBRUYsTUFBTTtnQkFFUCxLQUFLLHVDQUEwQixDQUFDLGdCQUFnQjtvQkFDL0MsTUFBTSxHQUFHO3dCQUNSLE1BQU0sRUFBRSx1Q0FBMEIsQ0FBQyxnQkFBZ0I7d0JBQ25ELFFBQVEsRUFBRSxhQUFhO3dCQUN2QixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsZ0JBQWdCLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUM7cUJBQzNDLENBQUM7b0JBRUYsTUFBTTtnQkFFUCxLQUFLLHVDQUEwQixDQUFDLFlBQVk7b0JBQzNDLE1BQU0sR0FBRzt3QkFDUixNQUFNLEVBQUUsdUNBQTBCLENBQUMsWUFBWTt3QkFDL0MsUUFBUSxFQUFFLGFBQWE7d0JBQ3ZCLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixpQkFBaUIsRUFBRSxpQkFBa0I7cUJBQ3JDLENBQUM7b0JBRUYsTUFBTTtnQkFFUDtvQkFDQyxNQUFNLEdBQUc7d0JBQ1IsTUFBTSxFQUFFLHVDQUEwQixDQUFDLFFBQVE7d0JBQzNDLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQywwQkFBMEI7d0JBQ3RDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQzt3QkFDdkIsY0FBYyxFQUFFLGNBQWM7cUJBQzlCLENBQUM7b0JBRUYsSUFBSSxDQUFDLHVCQUF1QixJQUFJLGVBQWUsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO3dCQUMvRixJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUVwRCxPQUFPLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQzt3QkFDL0IsYUFBYSxJQUFJLElBQUksZUFBZSxFQUFFLENBQUM7d0JBRXZDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTs0QkFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsNkRBQTZELGFBQWEseUJBQXlCLGVBQWUsR0FBRyxDQUFDLENBQUM7eUJBQ2hKO3FCQUNEO29CQUVELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxhQUFhLFFBQVEsVUFBVSxjQUFjLE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBWSxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztxQkFDakk7b0JBRUQsTUFBTTthQUNQO1lBRUQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFekQsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHVCQUF1QixLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDM0Y7Z0JBRUQsSUFBSSxxQkFBcUIsR0FBRyxLQUFLLENBQUM7Z0JBQ2xDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyx1Q0FBMEIsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDbEUscUJBQXFCLEdBQUcsSUFBSSxDQUFDO2lCQUU3QjtxQkFBTSxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO29CQUNuRCxxQkFBcUIsR0FBRyxJQUFJLENBQUM7b0JBRTdCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsNkJBQTZCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztxQkFDNUU7aUJBQ0Q7Z0JBRUQsSUFBSSxxQkFBcUIsRUFBRTtvQkFDMUIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQ0FBZ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3BHO29CQUVELEtBQUssTUFBTSxlQUFlLElBQUksZ0JBQWdCLEVBQUU7d0JBQy9DLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7cUJBQ3REO29CQUVELGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO29CQUV6QixJQUFJLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLEVBQUU7cUJBSTFDO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUVsQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsYUFBYSxRQUFRLHVDQUEwQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDaEk7WUFFRCxJQUFJLElBQUksQ0FBQywwQkFBMEIsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDeEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBRTFCO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sbUJBQW1CLENBQUMsT0FBZTtZQUMxQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQ0Q7SUFFRCxNQUFNLE9BQU8sR0FBYSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUU3QyxrQkFBZSxPQUFPLENBQUMifQ==