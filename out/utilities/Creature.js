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
        getNearbyCreatures(context, radius = this.nearbyCreatureRadius) {
            const point = context.human;
            const creatures = [];
            for (let x = -radius; x <= radius; x++) {
                for (let y = -radius; y <= radius; y++) {
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
                case ICreature_1.CreatureType.Coyote:
                    return !this.hasDecentEquipment(context);
                case ICreature_1.CreatureType.Kraken:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL0NyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFVQSxNQUFhLGlCQUFpQjtRQUE5QjtZQUVrQix5QkFBb0IsR0FBRyxDQUFDLENBQUM7UUF3RDNDLENBQUM7UUF0RE8sNkJBQTZCLENBQUMsT0FBZ0I7WUFDcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRS9ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQUtNLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0I7WUFDN0UsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUU1QixNQUFNLFNBQVMsR0FBZSxFQUFFLENBQUM7WUFFakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0UsSUFBSSxJQUFJLEVBQUUsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7d0JBQ3hGLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM5QjtpQkFDRDthQUNEO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsUUFBa0I7WUFDN0QsUUFBUSxRQUFRLENBQUMsSUFBSSxFQUFFO2dCQUN0QixLQUFLLHdCQUFZLENBQUMsS0FBSyxDQUFDO2dCQUN4QixLQUFLLHdCQUFZLENBQUMsTUFBTSxDQUFDO2dCQUN6QixLQUFLLHdCQUFZLENBQUMsTUFBTTtvQkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFMUMsS0FBSyx3QkFBWSxDQUFDLE1BQU07b0JBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO3dCQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksS0FBSyxnQkFBUSxDQUFDLFlBQVk7d0JBQzdFLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLGdCQUFRLENBQUMsU0FBUyxDQUFDO2dCQUU5RTtvQkFDQyxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDdEU7UUFDRixDQUFDO1FBRU0sa0JBQWtCLENBQUMsT0FBZ0I7WUFDekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDaEYsQ0FBQztLQUNEO0lBMURELDhDQTBEQyJ9