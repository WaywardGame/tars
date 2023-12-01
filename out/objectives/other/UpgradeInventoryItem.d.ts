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
import { ItemType } from "@wayward/game/game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import type { IInventoryItems } from "../../core/ITars";
import Objective from "../../core/objective/Objective";
export default class UpgradeInventoryItem extends Objective {
    private readonly upgrade;
    private readonly fromItemTypes;
    constructor(upgrade: keyof IInventoryItems, fromItemTypes?: Set<ItemType>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private addUpgradeObjectives;
}
