import { TarsMode } from "../ITars";
import type { ITarsMode } from "./IMode";
declare type TarsModeConstructor = new () => ITarsMode;
export declare const modes: Map<TarsMode, TarsModeConstructor>;
export {};
