import Translation from "language/Translation";
import type { SubpanelInformation } from "ui/screen/screens/game/component/TabDialog";
import TabDialog from "ui/screen/screens/game/component/TabDialog";
import type { DialogId, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import Tars from "../core/Tars";
import type TarsPanel from "./components/TarsPanel";
export declare type TabDialogPanelClass = new (tarsInstance: Tars) => TarsPanel;
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
