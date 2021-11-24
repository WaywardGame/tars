import Translation from "language/Translation";
import { TarsTranslation } from "../../ITars";
import TarsPanel from "../components/TarsPanel";
export default class GeneralPanel extends TarsPanel {
    private readonly buttonEnable;
    private readonly choiceListMode;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
