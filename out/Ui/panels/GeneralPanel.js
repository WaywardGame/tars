var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/ChoiceList", "ui/component/Divider", "utilities/enum/Enums", "utilities/Decorators", "../components/TarsPanel", "../../core/ITars", "../../ITarsMod"], function (require, exports, CheckButton_1, ChoiceList_1, Divider_1, Enums_1, Decorators_1, TarsPanel_1, ITars_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GeneralPanel extends TarsPanel_1.default {
        constructor() {
            super();
            this.buttonEnable = new CheckButton_1.CheckButton()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonEnable))
                .setRefreshMethod(() => this.TarsMod.tarsInstance?.isEnabled() ?? false)
                .event.subscribe("willToggle", (_, checked) => {
                if (this.TarsMod.tarsInstance?.isEnabled() !== checked) {
                    this.TarsMod.tarsInstance?.toggle();
                }
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.choiceListMode = new ChoiceList_1.default()
                .setChoices(...Enums_1.default.values(ITars_1.TarsMode).map(mode => {
                const choice = new ChoiceList_1.Choice(mode);
                if (mode === ITars_1.TarsMode.Manual) {
                    choice.hide();
                }
                else {
                    choice
                        .setText((0, ITarsMod_1.getTarsTranslation)(`DialogMode${ITars_1.TarsMode[mode]}`))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(`DialogMode${ITars_1.TarsMode[mode]}Tooltip`))));
                }
                return choice;
            }))
                .setRefreshMethod(list => list.choices(choice => choice.id === this.TarsMod.saveData.options.mode).first())
                .event.subscribe("choose", (_, choice) => {
                const mode = choice?.id;
                if (mode !== undefined && mode !== this.TarsMod.saveData.options.mode) {
                    this.TarsMod.tarsInstance?.updateOptions({ mode });
                }
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelGeneral;
        }
        onSwitchTo() {
            const events = this.TarsMod.event.until(this, "switchAway", "remove");
            events.subscribe("enableChange", this.refresh);
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            this.buttonEnable.refresh();
            this.choiceListMode.refresh();
            const isManual = this.TarsMod.saveData.options.mode === ITars_1.TarsMode.Manual;
            this.choiceListMode.setDisabled(isManual);
        }
    }
    __decorate([
        Decorators_1.Bound
    ], GeneralPanel.prototype, "refresh", null);
    exports.default = GeneralPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9HZW5lcmFsUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBV0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBTS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFNUixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQVcsRUFBRTtpQkFDaEMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUMvRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsSUFBSSxLQUFLLENBQUM7aUJBQ3ZFLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUMxQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxLQUFLLE9BQU8sRUFBRTtvQkFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7aUJBQ3ZDO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQztpQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxpQkFBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxvQkFBVSxFQUEwQjtpQkFDekQsVUFBVSxDQUFDLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLG1CQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hDLElBQUksSUFBSSxLQUFLLGdCQUFRLENBQUMsTUFBTSxFQUFFO29CQUUxQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBRWpCO3FCQUFNO29CQUNILE1BQU07eUJBQ0QsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDMUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxhQUFhLGdCQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUM5SDtnQkFFRCxPQUFPLE1BQU0sQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztpQkFDRixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDMUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3JDLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtvQkFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDdEQ7WUFDTCxDQUFDLENBQUM7aUJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxjQUFjO1lBQ2pCLE9BQU8sMEJBQWUsQ0FBQyxrQkFBa0IsQ0FBQztRQUM5QyxDQUFDO1FBRVMsVUFBVTtZQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN0RSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFHUyxPQUFPO1lBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRTlCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxNQUFNLENBQUM7WUFDeEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUNKO0lBUEc7UUFEQyxrQkFBSzsrQ0FPTDtJQXJFTCwrQkFzRUMifQ==