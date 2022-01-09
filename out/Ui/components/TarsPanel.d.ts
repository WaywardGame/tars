import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import type Translation from "language/Translation";
import type TarsMod from "../../TarsMod";
import type { TarsTranslation } from "../../ITarsMod";
export default abstract class TarsPanel extends TabDialogPanel {
    readonly TarsMod: TarsMod;
    abstract getTranslation(): TarsTranslation | Translation;
    protected abstract onSwitchTo(): void;
    protected abstract refresh(): void;
    protected _onSwitchTo(): void;
}
