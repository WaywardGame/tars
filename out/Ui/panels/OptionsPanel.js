var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "../../ITars", "../components/TarsPanel"], function (require, exports, CheckButton_1, Divider_1, ITars_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor() {
            super();
            this.refreshableComponents = [];
            for (const uiOption of ITars_1.uiConfigurableOptions) {
                if (uiOption === undefined) {
                    new Divider_1.default()
                        .appendTo(this);
                    continue;
                }
                const checkButton = new CheckButton_1.CheckButton()
                    .setText(this.TARS.getTranslation(uiOption.title))
                    .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(uiOption.tooltip))))
                    .setRefreshMethod(() => this.TARS.saveData.options[uiOption.option])
                    .event.subscribe("willToggle", (_, checked) => {
                    this.TARS.updateOptions({ [uiOption.option]: checked });
                    return true;
                })
                    .appendTo(this);
                this.refreshableComponents.push(checkButton);
            }
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelOptions;
        }
        onSwitchTo() {
            const events = this.TARS.event.until(this, "switchAway", "remove");
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            for (const button of this.refreshableComponents) {
                button.refresh();
            }
        }
    }
    __decorate([
        Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBT0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFISywwQkFBcUIsR0FBa0IsRUFBRSxDQUFDO1lBS3ZELEtBQUssTUFBTSxRQUFRLElBQUksNkJBQXFCLEVBQUU7Z0JBQzFDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsSUFBSSxpQkFBTyxFQUFFO3lCQUNSLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsU0FBUztpQkFDWjtnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLHlCQUFXLEVBQUU7cUJBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2pELFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3hHLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ25FLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ3hELE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDLENBQUM7cUJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwQixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2hEO1FBQ0wsQ0FBQztRQUVNLGNBQWM7WUFDakIsT0FBTyx1QkFBZSxDQUFDLGtCQUFrQixDQUFDO1FBQzlDLENBQUM7UUFFUyxVQUFVO1lBQ2hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBR1MsT0FBTztZQUNiLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUM3QyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDcEI7UUFDTCxDQUFDO0tBQ0o7SUFMRztRQURDLEtBQUs7K0NBS0w7SUExQ0wsK0JBMkNDIn0=