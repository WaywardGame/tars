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

import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import Creature from "game/entity/creature/Creature";
import { CreatureType } from "game/entity/creature/ICreature";
import Human from "game/entity/Human";
import { EquipType } from "game/entity/IHuman";

import type Context from "../core/context/Context";
import type { ITarsMode } from "../core/mode/IMode";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";
import Lambda from "../objectives/core/Lambda";
import TameCreatures from "../objectives/other/creature/TameCreatures";
import EquipItem from "../objectives/other/item/EquipItem";

export class TameCreatureMode implements ITarsMode {

    private finished: (success: boolean) => void;

    constructor(private readonly creatureType: CreatureType) {
    }

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

        const creatures = context.utilities.object.findTamableCreatures(context, "Tame", { type: this.creatureType });
        if (creatures.length > 0) {
            objectives.push(new TameCreatures(creatures));
        }

        objectives.push(new Lambda(async () => {
            this.finished(true);
            return ObjectiveResult.Complete;
        }));

        return objectives;
    }

    @EventHandler(EventBus.Creatures, "tame")
    public onCreatureTame(creature: Creature, owner: Human) {
        if (creature.type === this.creatureType && owner === localPlayer) {
            this.finished(true);
        }
    }
}
