import Translation from "language/Translation";
import { CheckButton } from "ui/component/CheckButton";

import { TarsTranslation, uiConfigurableOptions } from "../../ITars";
import TarsPanel from "../components/TarsPanel";

export default class OptionsPanel extends TarsPanel {

    private readonly refreshableComponents: CheckButton[] = [];

    constructor() {
        super();

        for (const uiOption of uiConfigurableOptions) {
            const checkButton = new CheckButton()
                .setText(this.TARS.getTranslation(uiOption.title))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(uiOption.tooltip))))
                .setRefreshMethod(() => this.TARS.saveData.options[uiOption.option])
                .event.subscribe("willToggle", (_, checked) => {
                    this.TARS.updateOptions({ [uiOption.option]: checked });
                    return true;
                })
                .appendTo(this);

            this.refreshableComponents.push(checkButton);
        }
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelOptions;
    }

    protected onSwitchTo() {
        const events = this.TARS.event.until(this, "switchAway", "remove");
        events.subscribe("optionsChange", this.refresh);
    }

    @Bound
    protected refresh() {
        for (const button of this.refreshableComponents) {
            button.refresh();
        }
    }
}
