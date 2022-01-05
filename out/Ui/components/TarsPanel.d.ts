import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import Translation from "language/Translation";
import TarsMod from "../../TarsMod";
import { TarsTranslation } from "../../ITarsMod";
export default abstract class TarsPanel extends TabDialogPanel {
    readonly TARS: TarsMod;
    abstract getTranslation(): TarsTranslation | Translation;
    protected abstract onSwitchTo(): void;
    protected abstract refresh(): void;
    protected _onSwitchTo(): void;
}
