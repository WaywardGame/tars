import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
export default class TasksPanel extends TarsPanel {
    private readonly dropdownItemType;
    private readonly dropdownDoodadType;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
