import Translation from "language/Translation";
import { CheckButton } from "ui/component/CheckButton";

import { TarsTranslation } from "../../ITars";
import TarsPanel from "../components/TarsPanel";

export default class OptionsPanel extends TarsPanel {

    private readonly buttonStayHealthy: CheckButton;
    private readonly buttonExploreIslands: CheckButton;

    constructor() {
        super();

        this.buttonStayHealthy = new CheckButton()
            .setText(this.TARS.getTranslation(TarsTranslation.DialogButtonStayHealthy))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonStayHealthyTooltip))))
            .setRefreshMethod(() => this.TARS.saveData.options.stayHealthy)
            .event.subscribe("willToggle", (_, checked) => {
                this.TARS.updateOptions({ stayHealthy: checked });
                return true;
            })
            .appendTo(this);

        this.buttonExploreIslands = new CheckButton()
            .setText(this.TARS.getTranslation(TarsTranslation.DialogButtonExploreIslands))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonExploreIslandsTooltip))))
            .setRefreshMethod(() => this.TARS.saveData.options.exploreIslands)
            .event.subscribe("willToggle", (_, checked) => {
                this.TARS.updateOptions({ exploreIslands: checked });
                return true;
            })
            .appendTo(this);
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
        this.buttonStayHealthy.refresh();
        this.buttonExploreIslands.refresh();
    }
}
