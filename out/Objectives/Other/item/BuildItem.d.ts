import Item from "game/item/Item";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class BuildItem extends Objective {
    private readonly item?;
    private target;
    private movements;
    constructor(item?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    onMove(context: Context): Promise<boolean | import("../../../IObjective").IObjective>;
    private getBaseInfo;
    private findInitialBuildTile;
    private isGoodTargetOrigin;
}
