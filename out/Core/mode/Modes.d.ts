import { ITarsMode } from "./IMode";
import { TarsMode } from "../ITars";
declare type TarsModeConstructor = {
    new (): ITarsMode;
};
export declare const modes: Map<TarsMode, TarsModeConstructor>;
export {};
