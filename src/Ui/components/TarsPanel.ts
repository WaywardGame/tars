import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { OwnEventHandler } from "event/EventManager";

import TarsMod from "../../TarsMod";
import { TARS_ID, TarsTranslation } from "../../ITarsMod";

export default abstract class TarsPanel extends TabDialogPanel {

    @Mod.instance<TarsMod>(TARS_ID)
    public readonly TARS: TarsMod;

    public abstract getTranslation(): TarsTranslation | Translation;

    protected abstract onSwitchTo(): void;

    protected abstract refresh(): void;

    @OwnEventHandler(TarsPanel, "switchTo")
    protected _onSwitchTo() {
        this.onSwitchTo();
        this.refresh();
    }
}
