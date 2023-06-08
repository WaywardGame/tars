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
import type Creature from "game/entity/creature/Creature";
import type { ILog } from "utilities/Log";
import type Context from "../context/Context";
import { ReserveType } from "../ITars";
import type { HashCodeFiltering, IObjective, ObjectiveExecutionResult } from "./IObjective";
import type Item from "game/item/Item";
import { LoggerUtilities } from "../../utilities/LoggerUtilities";
export default abstract class Objective implements IObjective {
    private static uuid;
    static reset(): void;
    enableLogging: boolean;
    protected includeUniqueIdentifierInHashCode?: boolean;
    includePositionInHashCode?: boolean;
    protected contextDataKey: string;
    protected _shouldKeepInInventory: boolean | undefined;
    protected reserveType: ReserveType | undefined;
    private _log;
    private _uniqueIdentifier;
    private _overrideDifficulty;
    private _status;
    abstract getIdentifier(context: Context | undefined): string;
    abstract getStatus(context: Context): string | undefined;
    abstract execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult>;
    get log(): ILog;
    ensureLogger(loggerUtilities: LoggerUtilities): void;
    setLogger(log: ILog | undefined): void;
    getHashCode(context: Context | undefined, skipContextDataKey?: boolean): string;
    toString(): string;
    getName(): string;
    getStatusMessage(context: Context): string | undefined;
    setStatus(status: IObjective | (() => string) | string): this;
    canSaveChildObjectives(): boolean;
    canGroupTogether(): boolean;
    isDynamic(): boolean;
    canIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean | HashCodeFiltering;
    shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean;
    overrideDifficulty(difficulty: number | undefined): this;
    passOverriddenDifficulty(objective: Objective): this;
    isDifficultyOverridden(): boolean;
    getDifficulty(context: Context): number;
    onMove(context: Context, ignoreCreature?: Creature): Promise<IObjective | boolean>;
    setContextDataKey(contextDataKey: string): this;
    shouldKeepInInventory(): boolean;
    keepInInventory(): this;
    setReserveType(reserveType: ReserveType | undefined): this;
    passAcquireData(objective: Objective, reserveType?: ReserveType): this;
    passShouldKeepInInventory(objective: Objective): this;
    protected getAcquiredItem(context: Context): Item | undefined;
    protected getBaseDifficulty(_context: Context): number;
    protected getUniqueIdentifier(): number;
    protected getUniqueContextDataKey(itemIdentifier: string): string;
}
