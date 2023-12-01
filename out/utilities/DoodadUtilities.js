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
define(["require", "exports", "@wayward/game/game/doodad/Doodads", "@wayward/game/game/doodad/IDoodad", "@wayward/game/utilities/enum/Enums", "@wayward/game/game/doodad/DoodadManager"], function (require, exports, Doodads_1, IDoodad_1, Enums_1, DoodadManager_1) {
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
        isWaterSourceDoodadBusy(waterSource) {
            if (waterSource.hasWater?.top) {
                return true;
            }
            if (waterSource.decay !== undefined &&
                waterSource.decay > 0 &&
                waterSource.gatherReady !== undefined &&
                waterSource.gatherReady > 0 &&
                waterSource.description?.providesFire) {
                return true;
            }
            return false;
        }
        isWaterSourceDoodadDrinkable(waterStill) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkVXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Eb29kYWRVdGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQVNILE1BQWEsZUFBZTtRQUVwQixjQUFjLENBQUMsaUJBQStDLEVBQUUsbUJBQTZCO1lBQ25HLE1BQU0sV0FBVyxHQUFvQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQy9DLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2dCQUM5QyxLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQzNDLE1BQU0saUJBQWlCLEdBQUcsNEJBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO3dCQUN4QixTQUFTO29CQUNWLENBQUM7b0JBRUQsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxDQUFDO3dCQUNwRCxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNyQixDQUFDO29CQUVELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQztvQkFDbEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3ZCLE1BQU0sb0JBQW9CLEdBQUcsNEJBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3JELElBQUksb0JBQW9CLElBQUksdUJBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQzs0QkFDN0UsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDckIsQ0FBQztvQkFDRixDQUFDO29CQUVELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFD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