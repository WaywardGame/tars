define(["require", "exports", "game/entity/creature/ICreature", "game/entity/IHuman", "game/item/IItem", "game/entity/IStats", "game/entity/player/IPlayer"], function (require, exports, ICreature_1, IHuman_1, IItem_1, IStats_1, IPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creatureUtilities = exports.CreatureUtilities = void 0;
    class CreatureUtilities {
        constructor() {
            this.nearbyCreatureRadius = 5;
        }
        shouldRunAwayFromAllCreatures(context) {
            const health = context.player.stat.get(IStats_1.Stat.Health);
            const stamina = context.player.stat.get(IStats_1.Stat.Stamina);
            return context.player.getWeightStatus() !== IPlayer_1.WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
        }
        getNearbyCreatures(context) {
            const point = context.player;
            const creatures = [];
            for (let x = -this.nearbyCreatureRadius; x <= this.nearbyCreatureRadius; x++) {
                for (let y = -this.nearbyCreatureRadius; y <= this.nearbyCreatureRadius; y++) {
                    const validPoint = context.island.ensureValidPoint({ x: point.x + x, y: point.y + y, z: point.z });
                    if (validPoint) {
                        const tile = context.island.getTileFromPoint(validPoint);
                        if (tile.creature && !tile.creature.isTamed() && tile.creature.hitchedTo === undefined) {
                            creatures.push(tile.creature);
                        }
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
                    return !this.hasDecentEquipment(context) ||
                        context.player.getEquippedItem(IHuman_1.EquipType.Legs).type === IItem_1.ItemType.BarkLeggings ||
                        context.player.getEquippedItem(IHuman_1.EquipType.Chest).type === IItem_1.ItemType.BarkTunic;
                default:
                    return creature.aberrant ? !this.hasDecentEquipment(context) : false;
            }
        }
        hasDecentEquipment(context) {
            const chest = context.player.getEquippedItem(IHuman_1.EquipType.Chest);
            const legs = context.player.getEquippedItem(IHuman_1.EquipType.Legs);
            const belt = context.player.getEquippedItem(IHuman_1.EquipType.Belt);
            const neck = context.player.getEquippedItem(IHuman_1.EquipType.Neck);
            const head = context.player.getEquippedItem(IHuman_1.EquipType.Head);
            const feet = context.player.getEquippedItem(IHuman_1.EquipType.Feet);
            const hands = context.player.getEquippedItem(IHuman_1.EquipType.Hands);
            return (chest && legs && belt && neck && head && feet && hands) ? true : false;
        }
    }
    exports.CreatureUtilities = CreatureUtilities;
    exports.creatureUtilities = new CreatureUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL0NyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFVQSxNQUFhLGlCQUFpQjtRQUE5QjtZQUVrQix5QkFBb0IsR0FBRyxDQUFDLENBQUM7UUEwRDNDLENBQUM7UUF4RE8sNkJBQTZCLENBQUMsT0FBZ0I7WUFDcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWhFLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEksQ0FBQztRQUtNLGtCQUFrQixDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFFN0IsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO1lBRWpDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0UsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM3RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdC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