import Translation from "language/Translation";
import { ItemType } from "game/item/IItem";
import Button from "ui/component/Button";
import ItemDropdown from "ui/component/dropdown/ItemDropdown";
import DoodadDropdown from "ui/component/dropdown/DoodadDropdown";
import { LabelledRow } from "ui/component/LabelledRow";
import Divider from "ui/component/Divider";
import { DoodadType } from "game/doodad/IDoodad";

import { TarsTranslation, TarsUiSaveDataKey } from "../../ITars";
import { AcquireItemMode } from "../../mode/modes/AcquireItem";
import TarsPanel from "../components/TarsPanel";
import { BuildDoodadMode } from "../../mode/modes/BuildDoodad";

export default class TasksPanel extends TarsPanel {

    private readonly dropdownItemType: ItemDropdown<string>;
    private readonly dropdownDoodadType: DoodadDropdown<string>;

    constructor() {
        super();

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelItem)))
            .append(this.dropdownItemType = new ItemDropdown(this.TARS.saveData.ui[TarsUiSaveDataKey.AcquireItemDropdown] ?? ItemType.Branch)
                .event.subscribe("selection", async (_, selection) => {
                    this.TARS.saveData.ui[TarsUiSaveDataKey.AcquireItemDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(this.TARS.getTranslation(TarsTranslation.DialogButtonAquireItem))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonAquireItemTooltip))))
            .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new AcquireItemMode(this.dropdownItemType.selection as ItemType));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);


        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelDoodad)))
            .append(this.dropdownDoodadType = new DoodadDropdown(this.TARS.saveData.ui[TarsUiSaveDataKey.BuildDoodadDropdown] ?? DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                    this.TARS.saveData.ui[TarsUiSaveDataKey.BuildDoodadDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(this.TARS.getTranslation(TarsTranslation.DialogButtonBuildDoodad))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonBuildDoodadTooltip))))
            .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new BuildDoodadMode(this.dropdownDoodadType.selection as DoodadType));
                return true;
            })
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelTasks;
    }

    protected onSwitchTo() {
    }

    @Bound
    protected refresh() {
    }
}
