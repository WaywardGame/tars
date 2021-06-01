var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/ChoiceList", "ui/component/LabelledRow", "ui/component/Divider", "utilities/enum/Enums", "../../ITars", "../components/TarsPanel"], function (require, exports, CheckButton_1, ChoiceList_1, LabelledRow_1, Divider_1, Enums_1, ITars_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GeneralPanel extends TarsPanel_1.default {
        constructor() {
            super();
            this.labelStatus = new LabelledRow_1.LabelledRow()
                .setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
                .appendTo(this);
            this.buttonEnable = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonEnable))
                .setRefreshMethod(() => this.TARS.isEnabled())
                .event.subscribe("willToggle", (_, checked) => {
                if (this.TARS.isEnabled() !== checked) {
                    this.TARS.toggle();
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
                        .setText(this.TARS.getTranslation(`DialogMode${ITars_1.TarsMode[mode]}`))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(`DialogMode${ITars_1.TarsMode[mode]}Tooltip`))));
                }
                return choice;
            }))
                .setRefreshMethod(list => list.choices(choice => choice.id === this.TARS.saveData.options.mode).first())
                .event.subscribe("choose", (_, choice) => {
                const mode = choice === null || choice === void 0 ? void 0 : choice.id;
                if (mode !== undefined && mode !== this.TARS.saveData.options.mode) {
                    this.TARS.updateOptions({ mode });
                }
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelGeneral;
        }
        onSwitchTo() {
            const events = this.TARS.event.until(this, "switchAway", "remove");
            events.subscribe("enableChange", this.refresh);
            events.subscribe("optionsChange", this.refresh);
            events.subscribe("statusChange", (_, status) => {
                this.labelStatus.setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelStatus).addArgs(status)));
            });
        }
        refresh() {
            this.buttonEnable.refresh();
            this.choiceListMode.refresh();
            const isManual = this.TARS.saveData.options.mode === ITars_1.TarsMode.Manual;
            this.choiceListMode.setDisabled(isManual);
        }
    }
    __decorate([
        Bound
    ], GeneralPanel.prototype, "refresh", null);
    exports.default = GeneralPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9HZW5lcmFsUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBVUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBTS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkseUJBQVcsRUFBRTtpQkFDL0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztpQkFDMUgsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSx5QkFBVyxFQUFFO2lCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUNyRSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2lCQUM3QyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sRUFBRTtvQkFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDdEI7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLGlCQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxD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