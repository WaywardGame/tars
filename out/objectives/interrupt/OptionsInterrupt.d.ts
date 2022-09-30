import Human from "game/entity/Human";
import type { IOptions } from "save/data/ISaveDataGlobal";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class OptionsInterrupt extends Objective {
    static previousOptions: Map<number, IOptions | undefined>;
    private static readonly desiredOptions;
    static restore(human: Human): void;
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
