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

import { EquipType } from "game/entity/IHuman";
import { TurnMode } from "game/IGame";

import type Context from "../core/context/Context";
import type { ITarsMode } from "../core/mode/IMode";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";
import Lambda from "../objectives/core/Lambda";
import HuntCreatures from "../objectives/other/creature/HuntCreatures";
import Idle from "../objectives/other/Idle";
import EquipItem from "../objectives/other/item/EquipItem";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";

/**
 * DUNDUN DUN DUNDUN
 */
export class TerminatorMode implements ITarsMode {

    private finished: (success: boolean) => void;

    public async initialize(_: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        objectives.push(new AcquireInventoryItem("knife"));

        if (!context.options.lockEquipment) {
            objectives.push([new AcquireInventoryItem("equipSword"), new EquipItem(EquipType.MainHand)]);
            objectives.push([new AcquireInventoryItem("equipShield"), new EquipItem(EquipType.OffHand)]);
        }

        const creatures = context.utilities.object.findHuntableCreatures(context, "Terminator", { onlyHostile: true });
        if (creatures.length > 0) {
            objectives.push(new HuntCreatures(creatures));
        }

        objectives.push(new MoveToBase());

        objectives.push(new OrganizeInventory());

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
