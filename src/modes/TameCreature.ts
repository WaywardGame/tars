import { ItemType } from "game/item/IItem";
import { EquipType } from "game/entity/IHuman";
import { CreatureType } from "game/entity/creature/ICreature";
import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import Creature from "game/entity/creature/Creature";
import Player from "game/entity/player/Player";

import TameCreatures from "../objectives/other/creature/TameCreatures";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import Lambda from "../objectives/core/Lambda";
import EquipItem from "../objectives/other/item/EquipItem";
import type { ITarsMode } from "../core/mode/IMode";

export class TameCreatureMode implements ITarsMode {

    private finished: (success: boolean) => void;

    constructor(private readonly creatureType: CreatureType) {
    }

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

        const creatures = context.utilities.object.findTamableCreatures(context, "Tame", { type: this.creatureType, top: 10 });
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
    public onCreatureTame(creature: Creature, owner: Player) {
        if (creature.type === this.creatureType && owner === localPlayer) {
            this.finished(true);
        }
    }
}
