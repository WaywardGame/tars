import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { OwnEventHandler } from "event/EventManager";

import { TarsTranslation, TARS_ID } from "../../ITars";
import Tars from "../../Tars";

export default abstract class TarsPanel extends TabDialogPanel {

    @Mod.instance<Tars>(TARS_ID)
    public readonly TARS: Tars;

    public abstract getTranslation(): TarsTranslation | Translation;

    protected abstract onSwitchTo(): void;

    protected abstract refresh(): void;

    @OwnEventHandler(TarsPanel, "switchTo")
    protected _onSwitchTo() {
        this.onSwitchTo();
        this.refresh();
    }
}
