import Doodad from "game/doodad/Doodad";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class StartFire extends Objective {
    private readonly doodad?;
    constructor(doodad?: Doodad | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
