import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import type Translation from "language/Translation";
import { OwnEventHandler } from "event/EventManager";

import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";

export default abstract class TarsPanel extends TabDialogPanel {

    public abstract getTranslation(): TarsTranslation | Translation;

    protected abstract onSwitchTo(): void;

    protected abstract refresh(): void;

    constructor(protected readonly tarsInstance: Tars) {
        super();
    }

    @OwnEventHandler(TarsPanel, "switchTo")
    protected _onSwitchTo() {
        this.onSwitchTo();
        this.refresh();
    }
}
