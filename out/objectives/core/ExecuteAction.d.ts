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
import type { AnyActionDescription } from "@wayward/game/game/entity/action/IAction";
import Message from "@wayward/game/language/dictionary/Message";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { GetActionArguments } from "../../utilities/ActionUtilities";
export default class ExecuteAction<T extends AnyActionDescription> extends Objective {
    private readonly action;
    private readonly args;
    private readonly expectedMessages?;
    private readonly expectedCannotUseResult?;
    protected readonly includeUniqueIdentifierInHashCode: boolean;
    constructor(action: T, args: GetActionArguments<T>, expectedMessages?: Set<Message> | undefined, expectedCannotUseResult?: ObjectiveResult | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
