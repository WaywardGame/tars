import Translation from "language/Translation";
import { TarsTranslation } from "../../ITars";
import TarsPanel from "../components/TarsPanel";
export default class OptionsPanel extends TarsPanel {
    private readonly refreshableComponents;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
