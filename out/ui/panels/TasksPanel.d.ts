import type Translation from "language/Translation";
import Tars from "../../core/Tars";
import { TarsTranslation } from "../../ITarsMod";
import TarsPanel from "../components/TarsPanel";
export default class TasksPanel extends TarsPanel {
    private readonly dropdownItemType;
    private readonly dropdownDoodadType;
    private readonly dropdownCreature;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
