import { OwnEventHandler } from "@wayward/utilities/event/EventManager";
import Translation from "@wayward/game/language/Translation";
import Message from "@wayward/game/language/dictionary/Message";
import type { DialogId, IDialogDescription } from "@wayward/game/ui/screen/screens/game/Dialogs";
import { Edge } from "@wayward/game/ui/screen/screens/game/Dialogs";
import type { SubpanelInformation } from "@wayward/game/ui/screen/screens/game/component/TabDialog";
import TabDialog from "@wayward/game/ui/screen/screens/game/component/TabDialog";
import { Tuple } from "@wayward/utilities/collection/Tuple";
import Vector2 from "@wayward/game/utilities/math/Vector2";
import { TarsTranslation, TarsUiSaveDataKey, getTarsTranslation } from "../ITarsMod";
import Tars from "../core/Tars";
import type TarsPanel from "./components/TarsPanel";
import DataPanel from "./panels/DataPanel";
import GeneralPanel from "./panels/GeneralPanel";
import GlobalOptionsPanel from "./panels/GlobalOptionsPanel";
import ModeOptionsPanel from "./panels/ModeOptionsPanel";
import MoveToPanel from "./panels/MoveToPanel";
import NPCsPanel from "./panels/NPCsPanel";
import TasksPanel from "./panels/TasksPanel";
import ViewportPanel from "./panels/ViewportPanel";

export type TabDialogPanelClass = new (tarsInstance: Tars) => TarsPanel;

/**
 * A list of panel classes that will appear in the dialog.
 */
const subpanelClasses: TabDialogPanelClass[] = [
	GeneralPanel,
	TasksPanel,
	MoveToPanel,
	GlobalOptionsPanel,
	ModeOptionsPanel,
	NPCsPanel,
	ViewportPanel,
	DataPanel,
];

export default class TarsDialog extends TabDialog<TarsPanel> {

	public static description: IDialogDescription = {
		minResolution: new Vector2(300, 200),
		size: new Vector2(40, 70),
		edges: [
			[Edge.Left, 25],
			[Edge.Bottom, 33],
		],
		saveOpen: false, // the dialog has custom initialization logic
	};

	private tarsInstance: Tars | undefined;

	public constructor(id: DialogId, subId: string = "") {
		super(id, subId, false);
	}

	protected override getDefaultSubpanelInformation(): SubpanelInformation | undefined {
		return this.subpanelInformations.find(spi => spi[0] === this.tarsInstance!.saveData.ui[TarsUiSaveDataKey.ActivePanelId]) ?? super.getDefaultSubpanelInformation();
	}

	@OwnEventHandler(TarsDialog, "changeSubpanel")
	protected onChangeSubpanel(activeSubpanel: SubpanelInformation): void {
		this.tarsInstance!.saveData.ui[TarsUiSaveDataKey.ActivePanelId] = activeSubpanel[0];
	}

	public override getName(): Translation {
		if (!this.tarsInstance) {
			return Translation.message(Message.None)
		}

		return getTarsTranslation(TarsTranslation.DialogTitleMain)
			.addArgs(this.tarsInstance.getName(), this.tarsInstance.getStatus());
	}

	public initialize(tarsInstance: Tars): void {
		if (this.tarsInstance !== tarsInstance) {
			this.tarsInstance = tarsInstance;
			this.initializeSubpanels();
		}

		this.tarsInstance.event.until(this, "remove").subscribe("statusChange", () => this.refreshHeader());

		this.refreshHeader();
	}

	public refreshHeader(): void {
		this.header.refresh();
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of subpanels.
	 * This will only be called once
	 */
	protected override getSubpanels(): TarsPanel[] {
		if (!this.tarsInstance) {
			return [];
		}

		let panels: TarsPanel[] = [];

		for (const panelClass of subpanelClasses) {
			if (panelClass === NPCsPanel && (this.subId.length !== 0 || !localPlayer.isHost)) {
				// don't show npc panel for npc dialog or for non-mp hostss
				continue;
			}

			if (panelClass === ViewportPanel && this.subId.length === 0) {
				// don't show viewport panel for main dialog
				continue;
			}

			panels.push(new panelClass(this.tarsInstance));
		}

		return panels;
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of tuples containing information used to set-up the
	 * subpanels of this dialog.
	 * 
	 * If the subpanel classes haven't been instantiated yet, it first instantiates them by calling getSubpanels.
	 * This includes binding a `WillRemove` event handler to the panel, which will `store` (cache) the panel instead of removing it,
	 * and trigger a `SwitchAway` event on the panel when this occurs.
	 */
	protected override getSubpanelInformation(subpanels: TarsPanel[]): SubpanelInformation[] {
		return subpanels
			.map(subpanel => Tuple(
				getTarsTranslation(subpanel.getTranslation()).getString(),
				getTarsTranslation(subpanel.getTranslation()),
				this.onShowSubpanel(subpanel),
			));
	}
}
