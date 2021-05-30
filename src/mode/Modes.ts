import { TarsMode } from "../ITars";

import { ITarsMode } from "./IMode";
import { SurvivalMode } from "./modes/Survival";
import { TidyUpMode } from "./modes/TidyUp";

export const modes: Map<TarsMode, ITarsMode> = new Map();

modes.set(TarsMode.Survival, new SurvivalMode());
modes.set(TarsMode.TidyUp, new TidyUpMode());
