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
            var _a;
            super();
            this.refreshableComponents = [];
            for (const uiOption of ITars_1.uiConfigurableOptions) {
                if (uiOption === undefined) {
                    new Divider_1.default()
                        .appendTo(this);
                    continue;
                }
                const checkButton = new CheckButton_1.CheckButton()
                    .setText(ITars_1.getTarsTranslation(uiOption.title))
                    .setTooltip(tooltip => tooltip.addText(text => text.setText(ITars_1.getTarsTranslation(uiOption.tooltip))))
                    .setRefreshMethod(() => this.TARS.saveData.options[uiOption.option])
                    .event.subscribe("willToggle", (_, checked) => {
                    this.TARS.updateOptions({ [uiOption.option]: checked });
                    return true;
                })
                    .appendTo(this);
                if ((_a = uiOption.isDisabled) === null || _a === void 0 ? void 0 : _a.call(uiOption)) {
                    checkButton.setDisabled(true);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBT0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DOztZQUNJLEtBQUssRUFBRSxDQUFDO1lBSEssMEJBQXFCLEdBQWtCLEVBQUUsQ0FBQztZQUt2RCxLQUFLLE1BQU0sUUFBUSxJQUFJLDZCQUFxQixFQUFFO2dCQUMxQyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLElBQUksaUJBQU8sRUFBRTt5QkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFO3FCQUNoQyxPQUFPLENBQUMsMEJBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUMzQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNsRyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNuRSxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUN4RCxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQyxDQUFDO3FCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFcEIsSUFBSSxNQUFBLFFBQVEsQ0FBQyxVQUFVLCtDQUFuQixRQUFRLENBQWUsRUFBRTtvQkFDekIsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDakM7Z0JBRUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNoRDtRQUNMLENBQUM7UUFFTSxjQUFjO1lBQ2pCLE9BQU8sdUJBQWUsQ0FBQyxrQkFBa0IsQ0FBQztRQUM5QyxDQUFDO1FBRVMsVUFBVTtZQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRSxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUdTLE9BQU87WUFDYixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3BCO1FBQ0wsQ0FBQztLQUNKO0lBTEc7UUFEQyxLQUFLOytDQUtMO0lBOUNMLCtCQStDQyJ9