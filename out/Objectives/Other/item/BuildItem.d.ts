import Item from "game/item/Item";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class BuildItem extends Objective {
    private readonly item?;
    private target;
    private movements;
    constructor(item?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    onMove(context: Context): Promise<boolean | import("../../../core/objective/IObjective").IObjective>;
    private getBaseInfo;
    private findInitialBuildTile;
    private isGoodTargetOrigin;
}
