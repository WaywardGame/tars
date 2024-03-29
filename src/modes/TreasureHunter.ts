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

import { TurnMode } from "game/IGame";
import { ItemType } from "game/item/IItem";
import DrawnMap from "game/mapping/DrawnMap";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import Idle from "../objectives/other/Idle";
import type { ITarsMode } from "../core/mode/IMode";
import GatherTreasures from "../objectives/gather/GatherTreasures";
import { BaseMode } from "./BaseMode";

export enum TreasureHunterType {
    OnlyDiscoverTreasure,
    DiscoverAndUnlockTreasure,
    ObtainTreasure,
}

export class TreasureHunterMode extends BaseMode implements ITarsMode {

    private finished: (success: boolean) => void;

    public async initialize(_: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        objectives.push(...await this.getBuildAnotherChestObjectives(context));

        let drawnMaps: DrawnMap[] = [];

        if (context.options.treasureHunterPrecognition) {
            drawnMaps = context.human.island.treasureMaps;

        } else {
            drawnMaps =
                context.utilities.item.getBaseItemsByType(context, ItemType.TatteredMap)
                    .map(item => item.map?.get())
                    .filter(drawnMap => drawnMap !== undefined) as DrawnMap[];
        }

        objectives.push(new GatherTreasures(drawnMaps, {
            disableUnlocking: context.options.treasureHunterType === TreasureHunterType.OnlyDiscoverTreasure,
            disableGrabbingItems: context.options.treasureHunterType !== TreasureHunterType.ObtainTreasure,
        }));

        if (!multiplayer.isConnected()) {
            if (game.getTurnMode() !== TurnMode.RealTime) {
                objectives.push(new Lambda(async () => {
                    this.finished(true);
                    return ObjectiveResult.Complete;
                }));

            } else {
                objectives.push(new Idle());
            }
        }

        return objectives;
    }
}
