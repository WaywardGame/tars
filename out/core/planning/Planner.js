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
define(["require", "exports", "@wayward/utilities/Log", "../context/ContextState", "../objective/IObjective", "./Plan"], function (require, exports, Log_1, ContextState_1, IObjective_1, Plan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Planner = void 0;
    class Planner {
        constructor(loggerUtilities, debug = false) {
            this.loggerUtilities = loggerUtilities;
            this.debug = debug;
            this.pendingTasks = 0;
            this.calculateDifficultyCache = new Map();
            this.calculatingDifficultyDepth = 0;
            this.calculationLog = [];
            this.log = loggerUtilities.createLog("Planner");
        }
        get shouldLog() {
            return this.calculatingDifficultyDepth <= 1;
        }
        get isCreatingPlan() {
            return this.calculatingDifficultyDepth !== 0;
        }
        reset() {
            this.calculateDifficultyCache.clear();
        }
        async createPlan(context, objective) {
            if (this.isCreatingPlan) {
                this.log.error(`Invalid difficulty depth ${this.calculatingDifficultyDepth}. Resetting to 0...`);
                this.calculatingDifficultyDepth = 0;
            }
            context.state.minimumAcceptedDifficulty = undefined;
            this.pendingTasks++;
            const result = await this.calculateDifficulty(context.clone(true, false), objective);
            this.pendingTasks--;
            if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible ||
                result.status === IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet ||
                result.status === IObjective_1.CalculatedDifficultyStatus.NotPlausible) {
                return undefined;
            }
            const objectiveInfo = result.objectiveChain[0];
            const objectives = result.objectiveChain.map(o => ({ ...o })).slice(1);
            return new Plan_1.default(this, context, objectiveInfo, objectives);
        }
        async pickEasiestObjectivePipeline(context, objectivesSets) {
            const start = performance.now();
            let easiestObjectivePipeline;
            if (this.shouldLog) {
                this.log.info(`Determining easiest objective. ${objectivesSets.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
            }
            if (this.debug) {
                this.writeCalculationLog(`Determining easiest objective. ${objectivesSets.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
            }
            let result = {
                status: IObjective_1.CalculatedDifficultyStatus.Impossible,
            };
            if (objectivesSets.length === 0) {
                return result;
            }
            const clonedContext = context.clone(true);
            let includeHashCode = false;
            let calculateObjectives = true;
            while (calculateObjectives) {
                calculateObjectives = false;
                for (const objectivesSet of objectivesSets) {
                    const objectiveStartTime = performance.now();
                    this.pendingTasks++;
                    const objectivePipeline = await this.getObjectivePipeline(clonedContext, objectivesSet);
                    this.pendingTasks--;
                    const objectiveDeltaTime = performance.now() - objectiveStartTime;
                    if (this.debug) {
                        this.writeCalculationLog(`Returned "${IObjective_1.CalculatedDifficultyStatus[objectivePipeline.status]}" for ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}.`);
                    }
                    switch (objectivePipeline.status) {
                        case IObjective_1.CalculatedDifficultyStatus.Impossible:
                            if (this.shouldLog) {
                                this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: Impossible. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            }
                            if (objectivePipeline.changes?.includeHashCode) {
                                includeHashCode = true;
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                            if (this.shouldLog) {
                                this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: NotCalculatedYet. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            }
                            if (result.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                                result = objectivePipeline;
                            }
                            else if (this.debug) {
                                this.writeCalculationLog("Not setting result");
                            }
                            break;
                        case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                            if (this.shouldLog) {
                                this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: NotPlausible. Difficulty: ${objectivePipeline.minimumDifficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            }
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
                            if (this.shouldLog) {
                                this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode(context)).join(" -> ")}. Status: Possible. Difficulty: ${objectivePipeline.difficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
                            }
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
                if (this.shouldLog) {
                    this.log.info(`Easiest objective for ${objectivesSets.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} is ${easiestObjectivePipeline.objectives.map(o => o.getHashCode(context)).join(" -> ")} (difficulty: ${easiestObjectivePipeline.difficulty}) (time: ${time.toFixed(2)}ms)`);
                }
                if (time >= 1000) {
                    this.log.warn(`Took ${time.toFixed(2)}ms to determine the easiest objective. ${objectivesSets.map(set => set.map(o => o.getHashCode(context)).join(" -> ")).join(", ")} (context: ${clonedContext.getHashCode()})`);
                }
                if (includeHashCode) {
                    easiestObjectivePipeline.changes.includeHashCode = includeHashCode;
                }
                return easiestObjectivePipeline;
            }
            if (this.shouldLog) {
                this.log.info(`All ${objectivesSets.length} objectives are impossible (time: ${time.toFixed(2)}ms)`);
            }
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
                this.pendingTasks++;
                let calculatedDifficulty = await this.calculateDifficulty(clonedContext, objective);
                this.pendingTasks--;
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
                    this.pendingTasks++;
                    calculatedDifficulty = await this.calculateDifficulty(clonedContext, objective);
                    this.pendingTasks--;
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
                this.calculationLog.length = 0;
                this.objectivesCounter = new Map();
            }
            const impossibleObjectiveHashCode = objective.includePositionInHashCode !== true ? objective.getHashCode(undefined, true) : undefined;
            if (impossibleObjectiveHashCode !== undefined) {
                if (this.debug) {
                    this.writeCalculationLog(`Checking difficulty for "${impossibleObjectiveHashCode}" (broad 1)`);
                }
                const result = this.calculateDifficultyCache.get(impossibleObjectiveHashCode);
                if (result?.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                    if (this.debug) {
                        this.writeCalculationLog(`Returning Impossible for "${impossibleObjectiveHashCode}" (broad 1)`);
                    }
                    return result;
                }
            }
            const objectiveHashCode = objective.getHashCode(context);
            let cachedDifficulty = this.checkAndMergeDifficultyCache(context, objectiveHashCode);
            if (cachedDifficulty !== undefined) {
                return cachedDifficulty;
            }
            let cacheHashCode = objectiveHashCode;
            let contextHashCode;
            let includedContextHashCode = false;
            const canIncludeContextHashCode = objective.canIncludeContextHashCode(context, impossibleObjectiveHashCode ?? objectiveHashCode);
            if (canIncludeContextHashCode !== false) {
                contextHashCode = canIncludeContextHashCode !== true ? context.getFilteredHashCode(canIncludeContextHashCode) : context.getHashCode();
                if (contextHashCode.length > 0) {
                    cachedDifficulty = this.checkAndMergeDifficultyCache(context, `${cacheHashCode}|${contextHashCode}`);
                    if (cachedDifficulty !== undefined) {
                        return cachedDifficulty;
                    }
                    if (objective.shouldIncludeContextHashCode(context, impossibleObjectiveHashCode ?? objectiveHashCode)) {
                        includedContextHashCode = true;
                        cacheHashCode += `|${contextHashCode}`;
                    }
                    else if (this.debug) {
                        this.writeCalculationLog(`Not including context hash code for "${impossibleObjectiveHashCode ?? objectiveHashCode}" (${Array.from(context.state.reservedItemTypesPerObjectiveHashCode ?? []).map(itemType => `${itemType[0]}:${Array.from(itemType[1]).join(";")}`).join(",")})`);
                    }
                }
            }
            let cacheImpossibledObjectiveHashCode;
            if (impossibleObjectiveHashCode) {
                cacheImpossibledObjectiveHashCode = includedContextHashCode ? `${impossibleObjectiveHashCode}|${contextHashCode}` : impossibleObjectiveHashCode;
                if (includedContextHashCode) {
                    if (this.debug) {
                        this.writeCalculationLog(`Checking difficulty for "${cacheImpossibledObjectiveHashCode}" (broad 2)`);
                    }
                    const result = this.calculateDifficultyCache.get(cacheImpossibledObjectiveHashCode);
                    if (result?.status === IObjective_1.CalculatedDifficultyStatus.Impossible) {
                        if (this.debug) {
                            this.writeCalculationLog(`Returning Impossible for "${cacheImpossibledObjectiveHashCode}" (broad 2)`);
                        }
                        return result;
                    }
                }
            }
            this.calculatingDifficultyDepth++;
            this.objectivesCounter.set(objectiveHashCode, (this.objectivesCounter.get(objectiveHashCode) ?? 0) + 1);
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
            if (this.debug) {
                const memoryLog = new Log_1.MemoryLog(...this.loggerUtilities.logSources, objectiveHashCode);
                memoryLog.setArray(objectiveInfo.logs);
                objective.setLogger(memoryLog);
            }
            const changes = context.watchForChanges();
            this.pendingTasks++;
            let executionResult = await objective.execute(context, impossibleObjectiveHashCode ?? objectiveHashCode);
            this.pendingTasks--;
            if (this.debug) {
                objective.setLogger(undefined);
            }
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
                        this.pendingTasks++;
                        pipelineResult = await this.pickEasiestObjectivePipeline(context, executionResult);
                        this.pendingTasks--;
                    }
                    else {
                        if (this.debug) {
                            this.writeCalculationLog(`Found objective pipeline with ${executionResult.length} objectives.`);
                        }
                        this.pendingTasks++;
                        pipelineResult = await this.getObjectivePipeline(context, executionResult);
                        this.pendingTasks--;
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
                        if (!objective.isDifficultyOverridden()) {
                            difficulty += pipelineResult.difficulty;
                        }
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
                if (cacheImpossibledObjectiveHashCode) {
                    cacheImpossibledObjectiveHashCode = impossibleObjectiveHashCode;
                }
                if (this.debug) {
                    this.writeCalculationLog("No need to include the hash code");
                }
            }
            switch (difficulty) {
                case IObjective_1.CalculatedDifficultyStatus.Impossible:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.Impossible,
                        changes,
                    };
                    if (cacheImpossibledObjectiveHashCode) {
                        this.calculateDifficultyCache.set(cacheImpossibledObjectiveHashCode, result);
                        if (this.debug) {
                            this.writeCalculationLog(`Set "${cacheImpossibledObjectiveHashCode}" to Impossible (broad). (depth: ${changes.depth})`);
                        }
                    }
                    break;
                case IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.NotCalculatedYet,
                        hashCode: cacheHashCode,
                        changes,
                        waitingHashCodes: new Set(waitingHashCodes),
                    };
                    break;
                case IObjective_1.CalculatedDifficultyStatus.NotPlausible:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.NotPlausible,
                        hashCode: cacheHashCode,
                        changes,
                        minimumDifficulty: minimumDifficulty,
                    };
                    break;
                default:
                    result = {
                        status: IObjective_1.CalculatedDifficultyStatus.Possible,
                        changes,
                        difficulty,
                        depth: this.calculatingDifficultyDepth,
                        objectives: [objective],
                        objectiveChain,
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
            if (this.calculatingDifficultyDepth === 0) {
                if (this.debug) {
                    this.writeCalculationLogToConsoleAndReset();
                }
                const counts = Array.from(this.objectivesCounter)
                    .filter(count => count[1] > 1)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                if (counts.length > 0) {
                    this.log.debug(`Objective Stats`, counts.join(", "));
                }
            }
            return result;
        }
        writeCalculationLog(message) {
            this.calculationLog.push(`${"\t".repeat(this.calculatingDifficultyDepth)}${message}\n`);
        }
        writeCalculationLogToConsoleAndReset() {
            let consoleMessage;
            try {
                consoleMessage = this.calculationLog.join("");
            }
            catch (ex) {
                consoleMessage = `BUFFERTOOLARGE:${this.calculationLog.length},${ex}`;
            }
            this.calculationLog.length = 0;
            this.log.debug(consoleMessage);
        }
    }
    exports.Planner = Planner;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQTJCSCxNQUFhLE9BQU87UUFrQm5CLFlBQTZCLGVBQWdDLEVBQVMsUUFBUSxLQUFLO1lBQXRELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7WUFiNUUsaUJBQVksR0FBRyxDQUFDLENBQUM7WUFLUCw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUV6RSwrQkFBMEIsR0FBRyxDQUFDLENBQUM7WUFDdEIsbUJBQWMsR0FBYSxFQUFFLENBQUM7WUFNOUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxJQUFXLFNBQVM7WUFDbkIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFLRCxJQUFXLGNBQWM7WUFDeEIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFLTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZDLENBQUM7UUFRTSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWdCLEVBQUUsU0FBcUI7WUFDOUQsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsMEJBQTBCLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2pHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUM7WUFDckMsQ0FBQztZQUdELE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEdBQUcsU0FBUyxDQUFDO1lBSXBE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