import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IIdleOptions {
    force: boolean;
    canMoveToIdle: boolean;
}
export default class Idle extends Objective {
    private readonly options?;
    constructor(options?: Partial<IIdleOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(): number;
}
