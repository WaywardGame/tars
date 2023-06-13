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
import { TarsMode } from "../ITars";
import type { ITarsMode } from "./IMode";
type TarsModeConstructor = new () => ITarsMode;
export declare const modes: Map<TarsMode, TarsModeConstructor>;
export {};
