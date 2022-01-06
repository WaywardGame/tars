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
import { uiConfigurableOptions, getTarsTranslation, TarsTranslation } from "../../ITarsMod";

export default class OptionsPanel extends TarsPanel {

    private readonly refreshableComponents: IRefreshable[] = [];

    constructor() {
        super();

        for (const uiOption of uiConfigurableOptions) {
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

            const slider = uiOption.slider;
            if (slider) {
                optionComponent = new RangeRow()
                    .setLabel(label => label
                        .setText(getTarsTranslation(uiOption.title))
                    )
                    .setTooltip(tooltip => tooltip
                        .addText(text => text.setText(getTarsTranslation(uiOption.tooltip)))
                        .setLocation(TooltipLocation.TopRight))
                    .editRange(range => range
                        .setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.TarsMod.tarsInstance!.getContext()))
                        .setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.TarsMod.tarsInstance!.getContext()))
                        .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option] as number))
                    .setDisplayValue(() => getTarsTranslation(TarsTranslation.DialogRangeLabel)
                        .get(this.TarsMod.saveData.options[uiOption.option] as number))
                    .event.subscribe("change", (_, value) => {
                        this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: value });
                    })
                    .setDisabled(isDisabled);

            } else {
                optionComponent = new CheckButton()
                    .setText(getTarsTranslation(uiOption.title))
                    .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(uiOption.tooltip))))
                    .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option] as boolean)
                    .event.subscribe("willToggle", (_, checked) => {
                        this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: checked });
                        return true;
                    })
                    .setDisabled(isDisabled);
            }

            optionComponent.appendTo(this);

            this.refreshableComponents.push(optionComponent);
        }
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelOptions;
    }

    protected onSwitchTo() {
        const events = this.TarsMod.event.until(this, "switchAway", "remove");
        events.subscribe("optionsChange", this.refresh);
    }

    @Bound
    protected refresh() {
        for (const button of this.refreshableComponents) {
            button.refresh();
        }
    }
}
