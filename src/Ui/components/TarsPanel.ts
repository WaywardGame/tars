import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import type Translation from "language/Translation";
import Mod from "mod/Mod";
import { OwnEventHandler } from "event/EventManager";

import type TarsMod from "../../TarsMod";
import type { TarsTranslation } from "../../ITarsMod";
import { TARS_ID } from "../../ITarsMod";

export default abstract class TarsPanel extends TabDialogPanel {

    @Mod.instance<TarsMod>(TARS_ID)
    public readonly TarsMod: TarsMod;

    public abstract getTranslation(): TarsTranslation | Translation;

    protected abstract onSwitchTo(): void;

    protected abstract refresh(): void;

    @OwnEventHandler(TarsPanel, "switchTo")
    protected _onSwitchTo() {
        this.onSwitchTo();
        this.refresh();
    }
}
