/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Mod from "@wayward/game/mod/Mod";
import Text from "@wayward/game/ui/component/Text";
import Bindable from "@wayward/game/ui/input/Bindable";
import type { QuadrantComponentId } from "@wayward/game/ui/screen/screens/game/IGameScreenApi";
import { Quadrant } from "@wayward/game/ui/screen/screens/game/component/IQuadrantComponent";
import QuadrantComponent from "@wayward/game/ui/screen/screens/game/component/QuadrantComponent";
import { Bound } from "@wayward/utilities/Decorators";
import { TARS_ID, TarsTranslation, getTarsTranslation } from "../../ITarsMod";
import type TarsMod from "../../TarsMod";

export default class TarsQuadrantComponent extends QuadrantComponent {

	@Mod.instance<TarsMod>(TARS_ID)
	public readonly TarsMod: TarsMod;

	public static preferredQuadrant = Quadrant.None;

	public override get preferredQuadrant(): Quadrant {
		return TarsQuadrantComponent.preferredQuadrant;
	}

	private readonly statusText: Text;

	public constructor(id: QuadrantComponentId) {
		super(id);

		this.classes.add("tars-quadrant-component", "hide-in-screenshot-mode");

		this.statusText = new Text()
			.appendTo(this);

		this.TarsMod.event.until(this, "remove").subscribe("statusChange", this.refresh);

		this.refresh();
	}

	public override getBindable(): Bindable {
		return this.TarsMod.bindableToggleQuadrantComponent;
	}

	@Bound
	private refresh(): void {
		const tarsInstance = this.TarsMod.tarsInstance;
		this.statusText.setText(getTarsTranslation(TarsTranslation.DialogTitleMain)
			.addArgs(tarsInstance?.getName(), tarsInstance?.getStatus() ?? "Not running"));
	}

}
