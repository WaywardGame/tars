var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "../objectives/acquire/item/AcquireItem"], function (require, exports, EventBuses_1, EventManager_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AcquireItemMode = void 0;
    class AcquireItemMode {
        constructor(itemType) {
            this.itemType = itemType;
        }
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(_) {
            return [new AcquireItem_1.default(this.itemType)];
        }
        onInventoryItemAddOrUpdate(_, item) {
            if (item.type === this.itemType) {
                this.finished(true);
            }
        }
    }
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "inventoryItemAdd"),
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "inventoryItemUpdate")
    ], AcquireItemMode.prototype, "onInventoryItemAddOrUpdate", null);
    exports.AcquireItemMode = AcquireItemMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQVdBLE1BQWEsZUFBZTtRQUkzQixZQUE2QixRQUFrQjtZQUFsQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQy9DLENBQUM7UUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUN2RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQVU7WUFDMUMsT0FBTyxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBSU0sMEJBQTBCLENBQUMsQ0FBUyxFQUFFLElBQVU7WUFFdEQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEI7UUFFRixDQUFDO0tBQ0Q7SUFQQTtRQUZDLElBQUEsMkJBQVksRUFBQyxxQkFBUSxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQztRQUN0RCxJQUFBLDJCQUFZLEVBQUMscUJBQVEsQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUM7cUVBT3pEO0lBdkJGLDBDQXdCQyJ9