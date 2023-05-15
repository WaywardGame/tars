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

import type Context from "../context/Context";
import type { IObjective } from "../objective/IObjective";

export interface ITarsMode {
	initialize?(context: Context, finished: (success: boolean) => void): Promise<void>;

	dispose?(context: Context): void;

	determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;

	getInterrupts?(context: Context): Promise<Array<IObjective | IObjective[] | undefined>>;
}
