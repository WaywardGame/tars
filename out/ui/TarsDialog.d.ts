/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import Translation from "language/Translation";
import type { DialogId, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import type { SubpanelInformation } from "ui/screen/screens/game/component/TabDialog";
import TabDialog from "ui/screen/screens/game/component/TabDialog";
import Tars from "../core/Tars";
import type TarsPanel from "./components/TarsPanel";
export type TabDialogPanelClass = new (tarsInstance: Tars) => TarsPanel;
export default class TarsDialog extends TabDialog<TarsPanel> {
    static description: IDialogDescription;
    private tarsInstance;
    constructor(id: DialogId, subId?: string);
    protected getDefaultSubpanelInformation(): SubpanelInformation;
    protected onChangeSubpanel(activeSubpanel: SubpanelInformation): void;
    getName(): Translation;
    initialize(tarsInstance: Tars): void;
    refreshHeader(): void;
    protected getSubpanels(): TarsPanel[];
    protected getSubpanelInformation(subpanels: TarsPanel[]): SubpanelInformation[];
}
