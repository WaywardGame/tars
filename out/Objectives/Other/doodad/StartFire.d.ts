import Doodad from "game/doodad/Doodad";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class StartFire extends Objective {
    private readonly doodad?;
    constructor(doodad?: Doodad | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
