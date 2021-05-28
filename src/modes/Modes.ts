import { TarsMode } from "../ITars";

import { ITarsMode } from "./IMode";
import { survivalMode } from "./Survival";

export const modes: Map<TarsMode, ITarsMode> = new Map();

modes.set(TarsMode.Survival, survivalMode);
