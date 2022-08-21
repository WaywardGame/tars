define(["require", "exports", "game/entity/IHuman", "game/item/IItem", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/acquire/item/AcquireItem", "../objectives/analyze/AnalyzeInventory", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem"], function (require, exports, IHuman_1, IItem_1, AcquireInventoryItem_1, AcquireItem_1, AnalyzeInventory_1, BuildItem_1, EquipItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCommonInitialObjectives = void 0;
    async function getCommonInitialObjectives(context) {
        const objectives = [];
        objectives.push(new AcquireInventoryItem_1.default("axe"));
        objectives.push(new AcquireInventoryItem_1.default("pickAxe"));
        if (context.base.campfire.length === 0) {
            objectives.push([new AcquireInventoryItem_1.default("campfire"), new BuildItem_1.default()]);
        }
        objectives.push(new AcquireInventoryItem_1.default("fireStarter"));
        objectives.push(new AcquireInventoryItem_1.default("fireKindling"));
        objectives.push(new AcquireInventoryItem_1.default("fireTinder"));
        objectives.push(new AcquireInventoryItem_1.default("shovel"));
        objectives.push(new AcquireInventoryItem_1.default("knife"));
        objectives.push(new AcquireInventoryItem_1.default("bed"));
        if (!context.options.lockEquipment) {
            objectives.push([new AcquireInventoryItem_1.default("equipSword"), new EquipItem_1.default(IHuman_1.EquipType.MainHand)]);
            const chest = context.human.getEquippedItem(IHuman_1.EquipType.Chest);
            if (chest === undefined || chest.type === IItem_1.ItemType.TatteredClothShirt) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.BarkTunic), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Chest)]);
            }
            const legs = context.human.getEquippedItem(IHuman_1.EquipType.Legs);
            if (legs === undefined || legs.type === IItem_1.ItemType.TatteredClothTrousers) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.BarkLeggings), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Legs)]);
            }
            objectives.push([new AcquireInventoryItem_1.default("equipShield"), new EquipItem_1.default(IHuman_1.EquipType.OffHand)]);
        }
        return objectives;
    }
    exports.getCommonInitialObjectives = getCommonInitialObjectives;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uSW5pdGlhbE9iamVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvQ29tbW9uSW5pdGlhbE9iamVjdGl2ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdPLEtBQUssVUFBVSwwQkFBMEIsQ0FBQyxPQUFnQjtRQUM3RCxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1FBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNwQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLG1CQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDNUU7UUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMxRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUN4RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNwRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVqRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFDaEMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdGLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0QsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxrQkFBa0IsRUFBRTtnQkFDbkUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsRUFBRSxJQUFJLG1CQUFTLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEg7WUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3BFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BIO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hHO1FBRUQsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQWxDRCxnRUFrQ0MifQ==