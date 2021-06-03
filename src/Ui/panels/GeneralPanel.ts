import Translation from "language/Translation";
import { CheckButton } from "ui/component/CheckButton";
import ChoiceList, { Choice } from "ui/component/ChoiceList";
import Divider from "ui/component/Divider";
import Enums from "utilities/enum/Enums";
import { TarsMode, TarsTranslation } from "../../ITars";
import TarsPanel from "../components/TarsPanel";


export default class GeneralPanel extends TarsPanel {

    // private readonly labelStatus: LabelledRow;
    private readonly buttonEnable: CheckButton;
    private readonly choiceListMode: ChoiceList<Choice<TarsMode>, true>;

    constructor() {
        super();

        // this.labelStatus = new LabelledRow()
        //     .setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
        //     .appendTo(this);

        this.buttonEnable = new CheckButton()
            .setText(this.TARS.getTranslation(TarsTranslation.DialogButtonEnable))
            .setRefreshMethod(() => this.TARS.isEnabled())
            .event.subscribe("willToggle", (_, checked) => {
                if (this.TARS.isEnabled() !== checked) {
                    this.TARS.toggle();
                }

                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        this.choiceListMode = new ChoiceList<Choice<TarsMode>, true>()
            .setChoices(...Enums.values(TarsMode).map(mode => {
                const choice = new Choice(mode);
                if (mode === TarsMode.Manual) {
                    // not a user selectable mode
                    choice.hide();

                } else {
                    choice
                        .setText(this.TARS.getTranslation(`DialogMode${TarsMode[mode]}`))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(`DialogMode${TarsMode[mode]}Tooltip`))))
                }

                return choice;
            }))
            .setRefreshMethod(list => list.choices(choice => choice.id === this.TARS.saveData.options.mode).first())
            .event.subscribe("choose", (_, choice) => {
                const mode = choice?.id;
                if (mode !== undefined && mode !== this.TARS.saveData.options.mode) {
                    this.TARS.updateOptions({ mode });
                }
            })
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelGeneral;
    }

    protected onSwitchTo() {
        const events = this.TARS.event.until(this, "switchAway", "remove");
        events.subscribe("enableChange", this.refresh);
        events.subscribe("optionsChange", this.refresh);
    }

    @Bound
    protected refresh() {
        this.buttonEnable.refresh();
        this.choiceListMode.refresh();

        const isManual = this.TARS.saveData.options.mode === TarsMode.Manual;
        this.choiceListMode.setDisabled(isManual);
    }
}
