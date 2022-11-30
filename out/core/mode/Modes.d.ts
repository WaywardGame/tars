import { TarsMode } from "../ITars";
import type { ITarsMode } from "./IMode";
type TarsModeConstructor = new () => ITarsMode;
export declare const modes: Map<TarsMode, TarsModeConstructor>;
export {};
