import Translation from "language/Translation";
import { TarsTranslation } from "../../ITars";
import TarsPanel from "../components/TarsPanel";
export default class TasksPanel extends TarsPanel {
    private readonly dropdownItemType;
    private readonly dropdownDoodadType;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
