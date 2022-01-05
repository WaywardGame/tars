import Player from "game/entity/player/Player";
import { IOptions } from "save/data/ISaveDataGlobal";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class OptionsInterrupt extends Objective {
    static previousOptions: IOptions | undefined;
    private static desiredOptions;
    static restore(player: Player): void;
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
