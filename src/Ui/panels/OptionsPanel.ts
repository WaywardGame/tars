import type Translation from "language/Translation";
import { CheckButton } from "ui/component/CheckButton";
import Divider from "ui/component/Divider";
import { RangeRow } from "ui/component/RangeRow";
import type { IRefreshable } from "ui/component/Refreshable";
import type Component from "ui/component/Component";
import { Heading } from "ui/component/Text";
import { TooltipLocation } from "ui/component/IComponent";
import { Bound } from "utilities/Decorators";

import TarsPanel from "../components/TarsPanel";
import { getTarsTranslation, TarsTranslation, TarsOptionSectionType, TarsOptionSection } from "../../ITarsMod";
import ChoiceList, { Choice } from "ui/component/ChoiceList";

export default abstract class OptionsPanel extends TarsPanel {

    private readonly refreshableComponents: IRefreshable[] = [];

    constructor(options: Array<TarsOptionSection | TarsTranslation | undefined>) {
        super();

        for (const uiOption of options) {
            if (uiOption === undefined) {
                new Divider()
                    .appendTo(this);
                continue;
            }

            if (typeof (uiOption) === "number") {
                new Heading()
                    .setText(getTarsTranslation(uiOption))
                    .appendTo(this);
                continue;
            }

            let optionComponent: Component & IRefreshable;

            const isDisabled = uiOption.isDisabled?.() ?? false;

            switch (uiOption.type) {
                case TarsOptionSectionType.Checkbox:
                    optionComponent = new CheckButton()
                        .setText(getTarsTranslation(uiOption.title))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(uiOption.tooltip))))
                        .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option] as boolean)
                        .event.subscribe("willToggle", (_, checked) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: checked });
                            return true;
                        })
                        .setDisabled(isDisabled);
                    break;

                case TarsOptionSectionType.Slider:
                    const slider = uiOption.slider;

                    const range = new RangeRow()
                        .setLabel(label => label
                            .setText(getTarsTranslation(uiOption.title))
                        )
                        .setTooltip(tooltip => tooltip
                            .addText(text => text.setText(getTarsTranslation(uiOption.tooltip)))
                            .setLocation(TooltipLocation.TopRight))
                        .setDisplayValue(() => getTarsTranslation(TarsTranslation.DialogRangeLabel).get(this.TarsMod.saveData.options[uiOption.option] as number))
                        .event.subscribe("change", (_, value) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: value });
                        })
                        .setDisabled(isDisabled);

                    range.editRange(range => range
                        .setMin(typeof (slider.min) === "number" ? slider.min : this.TarsMod.tarsInstance ? slider.min(this.TarsMod.tarsInstance.getContext()) : 0)
                        .setMax(typeof (slider.max) === "number" ? slider.max : this.TarsMod.tarsInstance ? slider.max(this.TarsMod.tarsInstance.getContext()) : 0)
                        .setRefreshMethod(() => {
                            range.setMin(typeof (slider.min) === "number" ? slider.min : this.TarsMod.tarsInstance ? slider.min(this.TarsMod.tarsInstance.getContext()) : 0)
                            range.setMax(typeof (slider.max) === "number" ? slider.max : this.TarsMod.tarsInstance ? slider.max(this.TarsMod.tarsInstance.getContext()) : 0)
                            return this.TarsMod.saveData.options[uiOption.option] as number;
                        }));

                    optionComponent = range;
                    break;

                case TarsOptionSectionType.Choice:
                    optionComponent = new ChoiceList<Choice<any>>()
                        .setChoices(Array.from(uiOption.choices).map(([textTranslation, tooltipTranslation, value]) =>
                            new Choice(value)
                                .setText(getTarsTranslation(textTranslation))
                                .setTooltip(tooltip => tooltip
                                    .addText(text => text.setText(getTarsTranslation(tooltipTranslation)))
                                    .setLocation(TooltipLocation.TopRight))
                        ))
                        .setRefreshMethod(list => list.choices(choice => choice.id === this.TarsMod.saveData.options[uiOption.option]).first()!)
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

    public abstract override getTranslation(): TarsTranslation | Translation;

    protected onSwitchTo() {
        const events = this.TarsMod.event.until(this, "switchAway", "remove");
        events.subscribe("optionsChange", this.refresh);
    }

    @Bound
    protected refresh() {
        for (const component of this.refreshableComponents) {
            component.refresh();
        }
    }
}
