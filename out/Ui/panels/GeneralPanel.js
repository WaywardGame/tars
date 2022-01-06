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
                .setRefreshMethod(() => { var _a, _b; return (_b = (_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.isEnabled()) !== null && _b !== void 0 ? _b : false; })
                .event.subscribe("willToggle", (_, checked) => {
                var _a, _b;
                if (((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.isEnabled()) !== checked) {
                    (_b = this.TarsMod.tarsInstance) === null || _b === void 0 ? void 0 : _b.toggle();
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
                var _a;
                const mode = choice === null || choice === void 0 ? void 0 : choice.id;
                if (mode !== undefined && mode !== this.TarsMod.saveData.options.mode) {
                    (_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.updateOptions({ mode });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9HZW5lcmFsUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBV0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBTS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFNUixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQVcsRUFBRTtpQkFDaEMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUMvRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsZUFBQyxPQUFBLE1BQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsU0FBUyxFQUFFLG1DQUFJLEtBQUssQ0FBQSxFQUFBLENBQUM7aUJBQ3ZFLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFOztnQkFDMUMsSUFBSSxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLDBDQUFFLFNBQVMsRUFBRSxNQUFLLE9BQU8sRUFBRTtvQkFDcEQsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsTUFBTSxFQUFFLENBQUM7aUJBQ3ZDO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQztpQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxpQkFBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxvQkFBVSxFQUEwQjtpQkFDekQsVUFBVSxDQUFDLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLG1CQUFN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