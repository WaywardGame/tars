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
import Entity from "game/entity/Entity";
import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class RunAwayFromTarget extends Objective {
    private readonly target;
    private readonly maxRunAwayDistance;
    constructor(target: Entity | IVector3, maxRunAwayDistance?: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
