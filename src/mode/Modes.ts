import { TarsMode } from "../ITars";

import { ITarsMode } from "./IMode";
import { GardenerMode } from "./modes/Gardener";
import { SurvivalMode } from "./modes/Survival";
import { TerminatorMode } from "./modes/Terminator";
import { TidyUpMode } from "./modes/TidyUp";

export const modes: Map<TarsMode, ITarsMode> = new Map();

modes.set(TarsMode.Survival, new SurvivalMode());
modes.set(TarsMode.TidyUp, new TidyUpMode());
modes.set(TarsMode.Gardener, new GardenerMode());
modes.set(TarsMode.Terminator, new TerminatorMode());
