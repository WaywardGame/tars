import { IslandId } from "game/island/IIsland";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class MoveToIsland extends Objective {
    private readonly islandId;
    constructor(islandId: IslandId);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
