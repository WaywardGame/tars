import { Stat } from "game/entity/IStats";
import Context from "../core/context/Context";
declare class PlayerUtilities {
    getWeight(context: Context): number;
    getMaxWeight(context: Context): number;
    isUsingVehicle(context: Context): boolean;
    isHealthy(context: Context): boolean;
    getRecoverThreshold(context: Context, stat: Stat): number;
    private parseThreshold;
}
export declare const playerUtilities: PlayerUtilities;
export {};
