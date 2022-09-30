import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
export default class TasksPanel extends TarsPanel {
    private readonly dropdownItemType;
    private readonly dropdownDoodadType;
    private readonly dropdownCreature;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
