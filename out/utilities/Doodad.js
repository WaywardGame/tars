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
define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "utilities/enum/Enums", "game/doodad/DoodadManager"], function (require, exports, Doodads_1, IDoodad_1, Enums_1, DoodadManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DoodadUtilities = void 0;
    class DoodadUtilities {
        getDoodadTypes(doodadTypeOrGroup, includeLitAndRevert) {
            const doodadTypes = new Set();
            if (DoodadManager_1.default.isGroup(doodadTypeOrGroup)) {
                for (const dt of Enums_1.default.values(IDoodad_1.DoodadType)) {
                    const doodadDescription = Doodads_1.doodadDescriptions[dt];
                    if (!doodadDescription) {
                        continue;
                    }
                    if (DoodadManager_1.default.isInGroup(dt, doodadTypeOrGroup)) {
                        doodadTypes.add(dt);
                    }
                    const lit = doodadDescription.lit;
                    if (lit !== undefined) {
                        const litDoodadDescription = Doodads_1.doodadDescriptions[lit];
                        if (litDoodadDescription && DoodadManager_1.default.isInGroup(lit, doodadTypeOrGroup)) {
                            doodadTypes.add(dt);
                        }
                    }
                    const revert = doodadDescription.revert;
                    if (revert !== undefined) {
                        const revertDoodadDescription = Doodads_1.doodadDescriptions[revert];
                        if (revertDoodadDescription && DoodadManager_1.default.isInGroup(revert, doodadTypeOrGroup)) {
                            doodadTypes.add(dt);
                        }
                    }
                }
            }
            else {
                doodadTypes.add(doodadTypeOrGroup);
                if (includeLitAndRevert) {
                    const doodadDescription = Doodads_1.doodadDescriptions[doodadTypeOrGroup];
                    if (doodadDescription) {
                        const lit = doodadDescription.lit;
                        if (lit !== undefined) {
                            const litDoodadDescription = Doodads_1.doodadDescriptions[lit];
                            if (litDoodadDescription) {
                                doodadTypes.add(lit);
                            }
                        }
                        const revert = doodadDescription.revert;
                        if (revert !== undefined) {
                            const revertDoodadDescription = Doodads_1.doodadDescriptions[revert];
                            if (revertDoodadDescription) {
                                doodadTypes.add(revert);
                            }
                        }
                    }
                }
            }
            return doodadTypes;
        }
        isWaterStillDesalinating(waterStill) {
            return (waterStill.decay !== undefined
                && waterStill.decay > 0
                && waterStill.gatherReady !== undefined
                && waterStill.gatherReady > 0
                && waterStill.description?.providesFire) ? true : false;
        }
        isWaterStillDrinkable(waterStill) {
            return waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0;
        }
        requiresFire(doodadTypeOrGroup) {
            const description = Doodads_1.doodadDescriptions[doodadTypeOrGroup];
            if (description && description.lit !== undefined) {
                if (DoodadManager_1.default.isGroup(doodadTypeOrGroup)) {
                    const litDescription = Doodads_1.doodadDescriptions[description.lit];
                    if (litDescription && DoodadManager_1.default.isInGroup(description.lit, doodadTypeOrGroup)) {
                        return true;
                    }
                }
                else if (description.lit === doodadTypeOrGroup) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.DoodadUtilities = DoodadUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQVNILE1BQWEsZUFBZTtRQUVwQixjQUFjLENBQUMsaUJBQStDLEVBQUUsbUJBQTZCO1lBQ25HLE1BQU0sV0FBVyxHQUFvQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQy9DLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDN0MsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsRUFBRTtvQkFDMUMsTUFBTSxpQkFBaUIsR0FBRyw0QkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUN2QixTQUFTO3FCQUNUO29CQUVELElBQUksdUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7d0JBQ25ELFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQztvQkFDbEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO3dCQUN0QixNQUFNLG9CQUFvQixHQUFHLDRCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNyRCxJQUFJLG9CQUFvQixJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFOzRCQUM1RSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUNwQjtxQkFDRDtvQkFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7b0JBQ3hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTt3QkFDekIsTUFBTSx1QkFBdUIsR0FBRyw0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