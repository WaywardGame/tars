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

import { IOverlayInfo, OverlayType } from "game/tile/ITerrain";
import Tile from "game/tile/Tile";
import GenericOverlay from "renderer/overlay/GenericOverlay";
import { IColorFul } from "utilities/Color";

export class TarsOverlay extends GenericOverlay<IOverlayInfo, [isBaseTile: boolean, isDisabled: boolean, penalty: number]> {

    public override getDefaultAlpha(): number {
        return 150;
    }

    protected override generateOverlayInfo(tile: Tile, isBaseTile: boolean, isDisabled: boolean, penalty: number): IOverlayInfo | undefined {
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
