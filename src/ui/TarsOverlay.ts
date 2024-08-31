import { IOverlayInfo, OverlayType } from "@wayward/game/game/tile/ITerrain";
import Tile from "@wayward/game/game/tile/Tile";
import GenericOverlay from "@wayward/game/renderer/overlay/GenericOverlay";
import { IColorFul } from "@wayward/utilities/Color";

export class TarsOverlay extends GenericOverlay<IOverlayInfo, [isBaseTile: boolean, isDisabled: boolean, penalty: number]> {

	public override getDefaultAlpha(): number {
		return 150;
	}

	protected override generateOverlayInfo(tile: Tile, previousOverlay: IOverlayInfo | undefined, isBaseTile: boolean, isDisabled: boolean, penalty: number): IOverlayInfo | undefined {
		let color: IColorFul;

		if (isBaseTile) {
			color = {
				red: 255,
				green: 0,
				blue: 0,
			};

		} else {
			color = {
				red: isDisabled ? 0 : Math.min(penalty, 255),
				green: isDisabled ? 0 : 255,
				blue: 0,
			};
		}

		return {
			type: OverlayType.Arrows,
			size: 16,
			offsetX: 0,
			offsetY: 48,
			...color,
			alpha: this.alpha,
		};
	}
}
