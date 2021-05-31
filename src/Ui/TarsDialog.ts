import { ItemType } from "game/item/IItem";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import Button from "ui/component/Button";
import { CheckButton } from "ui/component/CheckButton";
import ChoiceList, { Choice } from "ui/component/ChoiceList";
import Divider from "ui/component/Divider";
import ItemDropdown from "ui/component/dropdown/ItemDropdown";
import { LabelledRow } from "ui/component/LabelledRow";
import Dialog from "ui/screen/screens/game/component/Dialog";
import { DialogId, Edge, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import Enums from "utilities/enum/Enums";
import Vector2 from "utilities/math/Vector2";

import { TarsMode, TarsTranslation, TARS_ID } from "../ITars";
import { AcquireItemMode } from "../mode/modes/AcquireItem";
import Tars from "../Tars";

export default class TarsDialog extends Dialog {

	public static description: IDialogDescription = {
		minSize: new Vector2(15, 21),
		size: new Vector2(15, 70),
		maxSize: new Vector2(20, 70),
		edges: [
			[Edge.Left, 25],
			[Edge.Bottom, 33],
		],
	};

	@Mod.instance<Tars>(TARS_ID)
	public readonly TARS: Tars;

	private readonly labelStatus: LabelledRow;
	private readonly buttonEnable: CheckButton;
	private readonly choiceListMode: ChoiceList<Choice<TarsMode>, true>;
	private readonly buttonStayHealthy: CheckButton;
	private readonly buttonExploreIslands: CheckButton;
	private readonly dropdownItemType: ItemDropdown<string>;

	public constructor(id: DialogId) {
		super(id);

		this.registerHookHost("TarsDialog");

		this.labelStatus = new LabelledRow()
			.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
			.appendTo(this.body);

		this.buttonEnable = new CheckButton()
			.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonEnable))
			.setRefreshMethod(() => this.TARS.isEnabled())
			.event.subscribe("willToggle", (_, checked) => {
				if (this.TARS.isEnabled() !== checked) {
					this.TARS.toggle();
				}

				return true;
			})
			.appendTo(this.body);

		new Divider().appendTo(this.body);

		const modes = Enums.values(TarsMode).filter(modes => modes !== TarsMode.Manual);

		this.choiceListMode = new ChoiceList<Choice<TarsMode>, true>()
			.setCanChooseNone()
			.setChoices(...modes.map(mode => new Choice(mode)
				.setText(this.TARS.getTranslation(`DialogMode${TarsMode[mode]}`))
				.setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(`DialogMode${TarsMode[mode]}Tooltip`))))))
			.setRefreshMethod(list => list.choices(choice => choice.id === this.TARS.saveData.options.mode).first())
			.event.subscribe("choose", (_, choice) => {
				if (choice !== undefined) {
					this.TARS.updateOptions({ mode: choice.id });
				}
			})
			.appendTo(this.body);

		new Divider().appendTo(this.body);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelItem)))
			.append(this.dropdownItemType = new ItemDropdown(ItemType.Branch))
			.appendTo(this.body);

		new Button()
			.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonAquireItem))
			.setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonAquireItemTooltip))))
			.event.subscribe("activate", async () => {
				await this.TARS.activateManualMode(new AcquireItemMode(this.dropdownItemType.selection as ItemType));
				return true;
			})
			.appendTo(this.body);

		new Divider().appendTo(this.body);

		this.buttonStayHealthy = new CheckButton()
			.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonStayHealthy))
			.setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonStayHealthyTooltip))))
			.setRefreshMethod(() => this.TARS.saveData.options.stayHealthy)
			.event.subscribe("willToggle", (_, checked) => {
				this.TARS.updateOptions({ stayHealthy: checked });
				return true;
			})
			.appendTo(this.body);

		this.buttonExploreIslands = new CheckButton()
			.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonExploreIslands))
			.setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonExploreIslandsTooltip))))
			.setRefreshMethod(() => this.TARS.saveData.options.exploreIslands)
			.event.subscribe("willToggle", (_, checked) => {
				this.TARS.updateOptions({ exploreIslands: checked });
				return true;
			})
			.appendTo(this.body);

		////////////////////////////////////////////////////

		const events = this.TARS.event.until(this, "close");
		events.subscribe("enableChange", this.refresh);
		events.subscribe("optionsChange", this.refresh);
		events.subscribe("statusChange", (_, status) => {
			// don't call refresh because we already calculated status when passing it to this method
			// this.statusLabel.refresh();
			this.labelStatus.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(status)));
		});
	}

	@Override public getName(): Translation {
		return this.TARS.getTranslation(TarsTranslation.DialogTitleMain);
	}

	@Bound
	private refresh() {
		this.buttonEnable.refresh();
		this.choiceListMode.refresh();
		this.buttonStayHealthy.refresh();
		this.buttonExploreIslands.refresh();

		const isManual = this.TARS.saveData.options.mode === TarsMode.Manual;
		this.choiceListMode.setDisabled(isManual);
	}
}
