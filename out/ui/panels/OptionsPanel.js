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
define(["require", "exports", "@wayward/game/ui/component/CheckButton", "@wayward/game/ui/component/Divider", "@wayward/game/ui/component/RangeRow", "@wayward/game/ui/component/Text", "@wayward/utilities/Decorators", "@wayward/game/ui/component/ChoiceList", "@wayward/game/ui/screen/screens/game/component/Dialog", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, Decorators_1, ChoiceList_1, Dialog_1, ITarsMod_1, TarsPanel_1) {
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
    exports.default = OptionsPanel;
    __decorate([
        Decorators_1.Bound
    ], OptionsPanel.prototype, "refresh", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBaUJILE1BQThCLFlBQWEsU0FBUSxtQkFBUztRQUkzRCxZQUFZLFlBQWtCLEVBQUUsT0FBK0Q7WUFDOUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBSEosMEJBQXFCLEdBQW1CLEVBQUUsQ0FBQztZQUszRCxLQUFLLE1BQU0sUUFBUSxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxpQkFBTyxFQUFFO3lCQUNYLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakIsU0FBUztnQkFDVixDQUFDO2dCQUVELElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNwQyxJQUFJLGNBQU8sRUFBRTt5QkFDWCxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxRQUFRLENBQUMsQ0FBQzt5QkFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQixTQUFTO2dCQUNWLENBQUM7Z0JBRUQsSUFBSSxlQUF5QyxDQUFDO2dCQUU5QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxLQUFLLENBQUM7Z0JBRXBELFFBQVEsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN2QixLQUFLLGdDQUFxQixDQUFDLFFBQVE7d0JBQ2xDLGVBQWUsR0FBRyxJQUFJLHlCQUFXLEVBQUU7NkJBQ2pDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs2QkFDM0MsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FB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