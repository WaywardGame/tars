import { TurnMode } from "game/IGame";
import { ItemType } from "game/item/IItem";
import { EquipType } from "game/entity/IHuman";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import Lambda from "../objectives/core/Lambda";
import Idle from "../objectives/other/Idle";
import ReturnToBase from "../objectives/other/ReturnToBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import EquipItem from "../objectives/other/item/EquipItem";
import HuntCreatures from "../objectives/other/creature/HuntCreatures";
import type { ITarsMode } from "../core/mode/IMode";

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

        if (context.inventory.knife === undefined) {
            objectives.push([new AcquireItem(ItemType.StoneKnife), new AnalyzeInventory()]);
        }

        if (context.inventory.equipSword === undefined) {
            objectives.push([new AcquireItem(ItemType.WoodenSword), new AnalyzeInventory(), new EquipItem(EquipType.LeftHand)]);
        }

        if (context.inventory.equipShield === undefined) {
            objectives.push([new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new EquipItem(EquipType.RightHand)]);
        }

        const creatures = context.utilities.object.findHuntableCreatures(context, "Terminator", { onlyHostile: true, top: 10 });
        if (creatures.length > 0) {
            objectives.push(new HuntCreatures(creatures));
        }

        objectives.push(new ReturnToBase());

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
