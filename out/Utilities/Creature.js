define(["require", "exports", "entity/creature/ICreature", "entity/IHuman", "item/IItem"], function (require, exports, ICreature_1, IHuman_1, IItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isScaredOfCreatureType = exports.isScaredOfCreature = void 0;
    function isScaredOfCreature(context, creature) {
        return isScaredOfCreatureType(context, creature.type);
    }
    exports.isScaredOfCreature = isScaredOfCreature;
    function isScaredOfCreatureType(context, type) {
        switch (type) {
            case ICreature_1.CreatureType.Shark:
                return !hasDecentEquipment(context);
            case ICreature_1.CreatureType.Kraken:
                return !hasDecentEquipment(context)
                    && context.player.getEquippedItem(IHuman_1.EquipType.Legs).type !== IItem_1.ItemType.BarkLeggings
                    && context.player.getEquippedItem(IHuman_1.EquipType.Chest).type !== IItem_1.ItemType.BarkTunic;
        }
        return false;
    }
    exports.isScaredOfCreatureType = isScaredOfCreatureType;
    function hasDecentEquipment(context) {
        const chest = context.player.getEquippedItem(IHuman_1.EquipType.Chest);
        const legs = context.player.getEquippedItem(IHuman_1.EquipType.Legs);
        const belt = context.player.getEquippedItem(IHuman_1.EquipType.Belt);
        const neck = context.player.getEquippedItem(IHuman_1.EquipType.Neck);
        const head = context.player.getEquippedItem(IHuman_1.EquipType.Head);
        const feet = context.player.getEquippedItem(IHuman_1.EquipType.Feet);
        const hands = context.player.getEquippedItem(IHuman_1.EquipType.Hands);
        return (chest && legs && belt && neck && head && feet && hands) ? true : false;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbGl0aWVzL0NyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFPQSxTQUFnQixrQkFBa0IsQ0FBQyxPQUFnQixFQUFFLFFBQWtCO1FBQ3RFLE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRkQsZ0RBRUM7SUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxPQUFnQixFQUFFLElBQWtCO1FBQzFFLFFBQVEsSUFBSSxFQUFFO1lBQ2IsS0FBSyx3QkFBWSxDQUFDLEtBQUs7Z0JBQ3RCLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVyQyxLQUFLLHdCQUFZLENBQUMsTUFBTTtnQkFDdkIsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQzt1QkFDL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxZQUFZO3VCQUM5RSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBRSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLFNBQVMsQ0FBQztTQUNsRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQVpELHdEQVlDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxPQUFnQjtRQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDaEYsQ0FBQyJ9