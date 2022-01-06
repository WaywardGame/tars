var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "ui/component/RangeRow", "ui/component/Text", "ui/component/IComponent", "utilities/Decorators", "../components/TarsPanel", "../../ITarsMod"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, IComponent_1, Decorators_1, TarsPanel_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b;
            super();
            this.refreshableComponents = [];
            for (const uiOption of ITarsMod_1.uiConfigurableOptions) {
                if (uiOption === undefined) {
                    new Divider_1.default()
                        .appendTo(this);
                    continue;
                }
                if (typeof (uiOption) === "number") {
                    new Text_1.Heading()
                        .setText((0, ITarsMod_1.getTarsTranslation)(uiOption))
                        .appendTo(this);
                    continue;
                }
                let optionComponent;
                const isDisabled = (_b = (_a = uiOption.isDisabled) === null || _a === void 0 ? void 0 : _a.call(uiOption)) !== null && _b !== void 0 ? _b : false;
                const slider = uiOption.slider;
                if (slider) {
                    optionComponent = new RangeRow_1.RangeRow()
                        .setLabel(label => label
                        .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title)))
                        .setTooltip(tooltip => tooltip
                        .addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip)))
                        .setLocation(IComponent_1.TooltipLocation.TopRight))
                        .editRange(range => range
                        .setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.TarsMod.tarsInstance.getContext()))
                        .setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.TarsMod.tarsInstance.getContext()))
                        .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option]))
                        .setDisplayValue(() => (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogRangeLabel)
                        .get(this.TarsMod.saveData.options[uiOption.option]))
                        .event.subscribe("change", (_, value) => {
                        var _a;
                        (_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.updateOptions({ [uiOption.option]: value });
                    })
                        .setDisabled(isDisabled);
                }
                else {
                    optionComponent = new CheckButton_1.CheckButton()
                        .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip))))
                        .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option])
                        .event.subscribe("willToggle", (_, checked) => {
                        var _a;
                        (_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.updateOptions({ [uiOption.option]: checked });
                        return true;
                    })
                        .setDisabled(isDisabled);
                }
                optionComponent.appendTo(this);
                this.refreshableComponents.push(optionComponent);
            }
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelOptions;
        }
        onSwitchTo() {
            const events = this.TarsMod.event.until(this, "switchAway", "remove");
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            for (const button of this.refreshableComponents) {
                button.refresh();
            }
        }
    }
    __decorate([
        Decorators_1.Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBYUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DOztZQUNJLEtBQUssRUFBRSxDQUFDO1lBSEssMEJBQXFCLEdBQW1CLEVBQUUsQ0FBQztZQUt4RCxLQUFLLE1BQU0sUUFBUSxJQUFJLGdDQUFxQixFQUFFO2dCQUMxQyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLElBQUksaUJBQU8sRUFBRTt5QkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNoQyxJQUFJLGNBQU8sRUFBRTt5QkFDUixPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxRQUFRLENBQUMsQ0FBQzt5QkFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixTQUFTO2lCQUNaO2dCQUVELElBQUksZUFBeUMsQ0FBQztnQkFFOUMsTUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLFFBQVEsQ0FBQyxVQUFVLCtDQUFuQixRQUFRLENBQWUsbUNBQUksS0FBSyxDQUFDO2dCQUVwRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMvQixJQUFJLE1BQU0sRUFBRTtvQkFDUixlQUFlLEdBQUcsSUFBSSxtQkFBUSxFQUFFO3lCQUMzQixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLO3lCQUNuQixPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDL0M7eUJBQ0EsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTzt5QkFDekIsT0FBTyxDQUFDLElBQUksQ0FB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