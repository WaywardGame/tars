/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "ui/component/RangeRow", "ui/component/Text", "utilities/Decorators", "ui/component/ChoiceList", "ui/screen/screens/game/component/Dialog", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, Decorators_1, ChoiceList_1, Dialog_1, ITarsMod_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor(tarsInstance, options) {
            super(tarsInstance);
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
                            .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip)))
                            .setRefreshMethod(() => this.tarsInstance.saveData.options[uiOption.option])
                            .event.subscribe("willToggle", (_, checked) => {
                            this.tarsInstance.updateOptions({ [uiOption.option]: checked });
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
                            .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip))
                            .setLocation(Dialog_1.default.TooltipLocation))
                            .setDisplayValue(() => (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabel).get(this.tarsInstance.saveData.options[uiOption.option]))
                            .event.subscribe("change", (_, value) => {
                            this.tarsInstance.updateOptions({ [uiOption.option]: value });
                        })
                            .setDisabled(isDisabled);
                        range.editRange(range => range
                            .setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.tarsInstance.getContext()))
                            .setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.tarsInstance.getContext()))
                            .setRefreshMethod(() => {
                            range.setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.tarsInstance.getContext()));
                            range.setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.tarsInstance.getContext()));
                            return this.tarsInstance.saveData.options[uiOption.option];
                        }));
                        optionComponent = range;
                        break;
                    case ITarsMod_1.TarsOptionSectionType.Choice:
                        optionComponent = new ChoiceList_1.default()
                            .setChoices(Array.from(uiOption.choices).map(([textTranslation, tooltipTranslation, value]) => new ChoiceList_1.Choice(value)
                            .setText((0, ITarsMod_1.getTarsTranslation)(textTranslation))
                            .setTooltip(tooltip => tooltip
                            .setText((0, ITarsMod_1.getTarsTranslation)(tooltipTranslation))
                            .setLocation(handler => handler
                            .add("off right", ".dialog", "sticky center")
                            .add("off left", ".dialog", "sticky center")))))
                            .setRefreshMethod(list => list.choices(choice => choice.id === this.tarsInstance.saveData.options[uiOption.option]).first())
                            .event.subscribe("choose", (_, choice) => {
                            this.tarsInstance.updateOptions({ [uiOption.option]: choice.id });
                        })
                            .setDisabled(isDisabled);
                        break;
                }
                optionComponent.appendTo(this);
                this.refreshableComponents.push(optionComponent);
            }
        }
        onSwitchTo() {
            const events = this.tarsInstance.event.until(this, "switchAway", "remove");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBaUJILE1BQThCLFlBQWEsU0FBUSxtQkFBUztRQUl4RCxZQUFZLFlBQWtCLEVBQUUsT0FBK0Q7WUFDM0YsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBSFAsMEJBQXFCLEdBQW1CLEVBQUUsQ0FBQztZQUt4RCxLQUFLLE1BQU0sUUFBUSxJQUFJLE9BQU8sRUFBRTtnQkFDNUIsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUN4QixJQUFJLGlCQUFPLEVBQUU7eUJBQ1IsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixTQUFTO2lCQUNaO2dCQUVELElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDaEMsSUFBSSxjQUFPLEVBQUU7eUJBQ1IsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLENBQUM7eUJBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsU0FBUztpQkFDWjtnQkFFRCxJQUFJLGVBQXlDLENBQUM7Z0JBRTlDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLEtBQUssQ0FBQztnQkFFcEQsUUFBUSxRQUFRLENBQUMsSUFBSSxFQUFFO29CQUNuQixLQUFLLGdDQUFxQixDQUFDLFFBQVE7d0JBQy9CLGVBQWUsR0FBRyxJQUFJLHlCQUFXLEVBQUU7NkJBQzlCLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs2QkFDM0MsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxP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