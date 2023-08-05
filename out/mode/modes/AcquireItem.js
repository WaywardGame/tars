var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "../../objectives/acquire/item/AcquireItem"], function (require, exports, EventBuses_1, EventManager_1, AcquireItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZS9tb2Rlcy9BY3F1aXJlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBV0EsTUFBYSxlQUFlO1FBSTNCLFlBQTZCLFFBQWtCO1lBQWxCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDL0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3ZFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBVTtZQUMxQyxPQUFPLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFJTSwwQkFBMEIsQ0FBQyxDQUFTLEVBQUUsSUFBVTtZQUV0RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNwQjtRQUVGLENBQUM7S0FDRDtJQVBBO1FBRkMsSUFBQSwyQkFBWSxFQUFDLHFCQUFRLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDO1FBQ3RELElBQUEsMkJBQVksRUFBQyxxQkFBUSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQztxRUFPekQ7SUF2QkYsMENBd0JDIn0=