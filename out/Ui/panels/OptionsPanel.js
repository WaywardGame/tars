var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "ui/component/RangeRow", "ui/component/Text", "ui/component/IComponent", "utilities/Decorators", "../components/TarsPanel", "../../ITarsMod", "ui/component/ChoiceList"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, IComponent_1, Decorators_1, TarsPanel_1, ITarsMod_1, ChoiceList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor(options) {
            super();
            this.refreshableComponents = [];
            for (const uiOption of options) {
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
                const isDisabled = uiOption.isDisabled?.() ?? false;
                switch (uiOption.type) {
                    case ITarsMod_1.TarsOptionSectionType.Checkbox:
                        optionComponent = new CheckButton_1.CheckButton()
                            .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title))
                            .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip))))
                            .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option])
                            .event.subscribe("willToggle", (_, checked) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: checked });
                            return true;
                        })
                            .setDisabled(isDisabled);
                        break;
                    case ITarsMod_1.TarsOptionSectionType.Slider:
                        const slider = uiOption.slider;
                        const range = new RangeRow_1.RangeRow()
                            .setLabel(label => label
                            .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title)))
                            .setTooltip(tooltip => tooltip
                            .addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip)))
                            .setLocation(IComponent_1.TooltipLocation.TopRight))
                            .setDisplayValue(() => (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogRangeLabel).get(this.TarsMod.saveData.options[uiOption.option]))
                            .event.subscribe("change", (_, value) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: value });
                        })
                            .setDisabled(isDisabled);
                        range.editRange(range => range
                            .setMin(typeof (slider.min) === "number" ? slider.min : this.TarsMod.tarsInstance ? slider.min(this.TarsMod.tarsInstance.getContext()) : 0)
                            .setMax(typeof (slider.max) === "number" ? slider.max : this.TarsMod.tarsInstance ? slider.max(this.TarsMod.tarsInstance.getContext()) : 0)
                            .setRefreshMethod(() => {
                            range.setMin(typeof (slider.min) === "number" ? slider.min : this.TarsMod.tarsInstance ? slider.min(this.TarsMod.tarsInstance.getContext()) : 0);
                            range.setMax(typeof (slider.max) === "number" ? slider.max : this.TarsMod.tarsInstance ? slider.max(this.TarsMod.tarsInstance.getContext()) : 0);
                            return this.TarsMod.saveData.options[uiOption.option];
                        }));
                        optionComponent = range;
                        break;
                    case ITarsMod_1.TarsOptionSectionType.Choice:
                        optionComponent = new ChoiceList_1.default()
                            .setChoices(Array.from(uiOption.choices).map(([textTranslation, tooltipTranslation, value]) => new ChoiceList_1.Choice(value)
                            .setText((0, ITarsMod_1.getTarsTranslation)(textTranslation))
                            .setTooltip(tooltip => tooltip
                            .addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(tooltipTranslation)))
                            .setLocation(IComponent_1.TooltipLocation.TopRight))))
                            .setRefreshMethod(list => list.choices(choice => choice.id === this.TarsMod.saveData.options[uiOption.option]).first())
                            .event.subscribe("choose", (_, choice) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: choice.id });
                        })
                            .setDisabled(isDisabled);
                        break;
                }
                optionComponent.appendTo(this);
                this.refreshableComponents.push(optionComponent);
            }
        }
        onSwitchTo() {
            const events = this.TarsMod.event.until(this, "switchAway", "remove");
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            for (const component of this.refreshableComponents) {
                component.refresh();
            }
        }
    }
    __decorate([
        Decorators_1.Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBY0EsTUFBOEIsWUFBYSxTQUFRLG1CQUFTO1FBSXhELFlBQVksT0FBK0Q7WUFDdkUsS0FBSyxFQUFFLENBQUM7WUFISywwQkFBcUIsR0FBbUIsRUFBRSxDQUFDO1lBS3hELEtBQUssTUFBTSxRQUFRLElBQUksT0FBTyxFQUFFO2dCQUM1QixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLElBQUksaUJBQU8sRUFBRTt5QkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNoQyxJQUFJLGNBQU8sRUFBRTt5QkFDUixPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxRQUFRLENBQUMsQ0FBQzt5QkFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixTQUFTO2lCQUNaO2dCQUVELElBQUksZUFBeUMsQ0FBQztnQkFFOUMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDO2dCQUVwRCxRQUFRLFFBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQ25CLEtBQUssZ0NBQXFCLENBQUMsUUFBUTt3QkFDL0IsZUFBZSxHQUFHLElBQUkseUJBQVcsRUFBRTs2QkFDOUIsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUMzQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxP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