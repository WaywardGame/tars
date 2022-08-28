import type { AnyActionDescription } from "game/entity/action/IAction";
import Message from "language/dictionary/Message";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { GetActionArguments } from "../../utilities/Action";
export default class ExecuteAction<T extends AnyActionDescription> extends Objective {
    private readonly action;
    private readonly args;
    private readonly expectedMessages?;
    private readonly expectedCannotUseResult?;
    protected includeUniqueIdentifierInHashCode: boolean;
    constructor(action: T, args: GetActionArguments<T>, expectedMessages?: Set<Message> | undefined, expectedCannotUseResult?: ObjectiveResult | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
