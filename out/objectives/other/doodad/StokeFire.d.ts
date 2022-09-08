import type Doodad from "game/doodad/Doodad";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class StokeFire extends Objective {
    private readonly doodad?;
    private readonly numberOfStokes;
    constructor(doodad?: Doodad | undefined, numberOfStokes?: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
