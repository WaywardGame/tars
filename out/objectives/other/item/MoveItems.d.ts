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
import Doodad from "@wayward/game/game/doodad/Doodad";
import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import { IVector3 } from "@wayward/game/utilities/math/IVector";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveItems extends Objective {
    private readonly targetContainer;
    private readonly source?;
    private readonly items;
    constructor(itemOrItems: Item | Item[] | undefined, targetContainer: IContainer, source?: (Doodad | IVector3) | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(): number;
}
