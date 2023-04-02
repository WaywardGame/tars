define(["require", "exports", "game/entity/creature/ICreature", "game/entity/IHuman", "game/item/IItem", "game/entity/IStats", "game/entity/player/IPlayer"], function (require, exports, ICreature_1, IHuman_1, IItem_1, IStats_1, IPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreatureUtilities = void 0;
    class CreatureUtilities {
        constructor() {
            this.nearbyCreatureRadius = 5;
        }
        shouldRunAwayFromAllCreatures(context) {
            const health = context.human.stat.get(IStats_1.Stat.Health);
            const stamina = context.human.stat.get(IStats_1.Stat.Stamina);
            return context.human.getWeightStatus() !== IPlayer_1.WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
        }
        getNearbyCreatures(context) {
            const point = context.human;
            const creatures = [];
            for (let x = -this.nearbyCreatureRadius; x <= this.nearbyCreatureRadius; x++) {
                for (let y = -this.nearbyCreatureRadius; y <= this.nearbyCreatureRadius; y++) {
                    const tile = context.island.getTileSafe(point.x + x, point.y + y, point.z);
                    if (tile?.creature && !tile.creature.isTamed() && tile.creature.hitchedTo === undefined) {
                        creatures.push(tile.creature);
                    }
                }
            }
            return creatures;
        }
        isScaredOfCreature(context, creature) {
            switch (creature.type) {
                case ICreature_1.CreatureType.Shark:
                case ICreature_1.CreatureType.Zombie:
                    return !this.hasDecentEquipment(context);
                case ICreature_1.CreatureType.Kraken:
                case ICreature_1.CreatureType.Coyote:
                    return !this.hasDecentEquipment(context) ||
                        context.human.getEquippedItem(IHuman_1.EquipType.Legs)?.type === IItem_1.ItemType.BarkLeggings ||
                        context.human.getEquippedItem(IHuman_1.EquipType.Chest)?.type === IItem_1.ItemType.BarkTunic;
                default:
                    return creature.aberrant ? !this.hasDecentEquipment(context) : false;
            }
        }
        hasDecentEquipment(context) {
            const chest = context.human.getEquippedItem(IHuman_1.EquipType.Chest) ? 1 : 0;
            const legs = context.human.getEquippedItem(IHuman_1.EquipType.Legs) ? 1 : 0;
            const waist = context.human.getEquippedItem(IHuman_1.EquipType.Waist) ? 1 : 0;
            const neck = context.human.getEquippedItem(IHuman_1.EquipType.Neck) ? 1 : 0;
            const head = context.human.getEquippedItem(IHuman_1.EquipType.Head) ? 1 : 0;
            const feet = context.human.getEquippedItem(IHuman_1.EquipType.Feet) ? 1 : 0;
            const hands = context.human.getEquippedItem(IHuman_1.EquipType.Hands) ? 1 : 0;
            return (chest + legs + waist + neck + head + feet + hands) >= 4 ? true : false;
        }
    }
    exports.CreatureUtilities = CreatureUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL0NyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFVQSxNQUFhLGlCQUFpQjtRQUE5QjtZQUVrQix5QkFBb0IsR0FBRyxDQUFDLENBQUM7UUF3RDNDLENBQUM7UUF0RE8sNkJBQTZCLENBQUMsT0FBZ0I7WUFDcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRS9ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQUtNLGtCQUFrQixDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFFNUIsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO1lBRWpDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0UsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM3RSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFdB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