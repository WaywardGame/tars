var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "../../ITars", "../components/TarsPanel"], function (require, exports, CheckButton_1, ITars_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor() {
            super();
            this.buttonStayHealthy = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonStayHealthy))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonStayHealthyTooltip))))
                .setRefreshMethod(() => this.TARS.saveData.options.stayHealthy)
                .event.subscribe("willToggle", (_, checked) => {
                this.TARS.updateOptions({ stayHealthy: checked });
                return true;
            })
                .appendTo(this);
            this.buttonExploreIslands = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonExploreIslands))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonExploreIslandsTooltip))))
                .setRefreshMethod(() => this.TARS.saveData.options.exploreIslands)
                .event.subscribe("willToggle", (_, checked) => {
                this.TARS.updateOptions({ exploreIslands: checked });
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelOptions;
        }
        onSwitchTo() {
            const events = this.TARS.event.until(this, "switchAway", "remove");
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            this.buttonStayHealthy.refresh();
            this.buttonExploreIslands.refresh();
        }
    }
    __decorate([
        Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBTUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSy9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSx5QkFBVyxFQUFFO2lCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2lCQUMxRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBZSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN0SSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO2lCQUM5RCxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDbEQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSx5QkFBVyxFQUFFO2lCQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2lCQUM3RSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBZSxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6SSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO2lCQUNqRSxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDckQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRU0sY0FBYztZQUNqQixPQUFPLHVCQUFlLENBQUMsa0JBQWtCLENBQUM7UUFDOUMsQ0FBQztRQUVTLFVBQVU7WUFDaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFHUyxPQUFPO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QyxDQUFDO0tBQ0o7SUFKRztRQURDLEtBQUs7K0NBSUw7SUExQ0wsK0JBMkNDIn0=