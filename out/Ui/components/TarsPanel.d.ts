import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import Translation from "language/Translation";
import { TarsTranslation } from "../../ITars";
import Tars from "../../Tars";
export default abstract class TarsPanel extends TabDialogPanel {
    readonly TARS: Tars;
    abstract getTranslation(): TarsTranslation | Translation;
    protected abstract onSwitchTo(): void;
    protected abstract refresh(): void;
    protected _onSwitchTo(): void;
}
