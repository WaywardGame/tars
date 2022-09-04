import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class AddDifficulty extends Objective {
    private readonly difficulty;
    readonly includePositionInHashCode: boolean;
    constructor(difficulty: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
