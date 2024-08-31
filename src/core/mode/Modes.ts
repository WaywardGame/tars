import { AnglerMode } from "../../modes/Angler";
import { GardenerMode } from "../../modes/Gardener";
import { HarvesterMode } from "../../modes/Harvester";
import { QuestMode } from "../../modes/Quest";
import { SurvivalMode } from "../../modes/Survival";
import { TerminatorMode } from "../../modes/Terminator";
import { TidyUpMode } from "../../modes/TidyUp";
import { TreasureHunterMode } from "../../modes/TreasureHunter";
import { TarsMode } from "../ITars";
import type { ITarsMode } from "./IMode";

type TarsModeConstructor = new () => ITarsMode

export const modes: Map<TarsMode, TarsModeConstructor> = new Map();

modes.set(TarsMode.Survival, SurvivalMode);
modes.set(TarsMode.TidyUp, TidyUpMode);
modes.set(TarsMode.Gardener, GardenerMode);
modes.set(TarsMode.Harvester, HarvesterMode);
modes.set(TarsMode.Terminator, TerminatorMode);
modes.set(TarsMode.TreasureHunter, TreasureHunterMode);
modes.set(TarsMode.Quest, QuestMode);
modes.set(TarsMode.Angler, AnglerMode);

