define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "utilities/enum/Enums", "game/doodad/DoodadManager"], function (require, exports, Doodads_1, IDoodad_1, Enums_1, DoodadManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.doodadUtilities = void 0;
    class DoodadUtilities {
        getDoodadTypes(doodadTypeOrGroup, includeLitAndRevert) {
            const doodadTypes = new Set();
            if (DoodadManager_1.default.isGroup(doodadTypeOrGroup)) {
                for (const dt of Enums_1.default.values(IDoodad_1.DoodadType)) {
                    const doodadDescription = Doodads_1.default[dt];
                    if (!doodadDescription) {
                        continue;
                    }
                    if (DoodadManager_1.default.isInGroup(dt, doodadTypeOrGroup)) {
                        doodadTypes.add(dt);
                    }
                    const lit = doodadDescription.lit;
                    if (lit !== undefined) {
                        const litDoodadDescription = Doodads_1.default[lit];
                        if (litDoodadDescription && DoodadManager_1.default.isInGroup(lit, doodadTypeOrGroup)) {
                            doodadTypes.add(dt);
                        }
                    }
                    const revert = doodadDescription.revert;
                    if (revert !== undefined) {
                        const revertDoodadDescription = Doodads_1.default[revert];
                        if (revertDoodadDescription && DoodadManager_1.default.isInGroup(revert, doodadTypeOrGroup)) {
                            doodadTypes.add(dt);
                        }
                    }
                }
            }
            else {
                doodadTypes.add(doodadTypeOrGroup);
                if (includeLitAndRevert) {
                    const doodadDescription = Doodads_1.default[doodadTypeOrGroup];
                    if (doodadDescription) {
                        const lit = doodadDescription.lit;
                        if (lit !== undefined) {
                            const litDoodadDescription = Doodads_1.default[lit];
                            if (litDoodadDescription) {
                                doodadTypes.add(lit);
                            }
                        }
                        const revert = doodadDescription.revert;
                        if (revert !== undefined) {
                            const revertDoodadDescription = Doodads_1.default[revert];
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
            var _a;
            return (waterStill.decay !== undefined
                && waterStill.decay > 0
                && waterStill.gatherReady !== undefined
                && waterStill.gatherReady > 0
                && ((_a = waterStill.description()) === null || _a === void 0 ? void 0 : _a.providesFire)) ? true : false;
        }
        isWaterStillDrinkable(waterStill) {
            return waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0;
        }
    }
    exports.doodadUtilities = new DoodadUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU1BLE1BQU0sZUFBZTtRQUViLGNBQWMsQ0FBQyxpQkFBK0MsRUFBRSxtQkFBNkI7WUFDbkcsTUFBTSxXQUFXLEdBQW9CLElBQUksR0FBRyxFQUFFLENBQUM7WUFDL0MsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUM3QyxLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxFQUFFO29CQUMxQyxNQUFNLGlCQUFpQixHQUFHLGlCQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3RDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDdkIsU0FBUztxQkFDVDtvQkFFRCxJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO3dCQUNuRCxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUM7b0JBQ2xDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTt3QkFDdEIsTUFBTSxvQkFBb0IsR0FBRyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUMxQyxJQUFJLG9CQUFvQixJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFOzRCQUM1RSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUNwQjtxQkFDRDtvQkFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7b0JBQ3hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTt3QkFDekIsTUFBTSx1QkFBdUIsR0FBRyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoRCxJQUFJLHVCQUF1QixJQUFJLHVCQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFFOzRCQUNsRixXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUNwQjtxQkFDRDtpQkFDRDthQUVEO2lCQUFNO2dCQUNOLFdBQVcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFFbkMsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsTUFBTSxpQkFBaUIsR0FBRyxpQkFBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ3JELElBQUksaUJBQWlCLEVBQUU7d0JBQ3RCLE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQzt3QkFDbEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFOzRCQUN0QixNQUFNLG9CQUFvQixHQUFHLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQzFDLElBQUksb0JBQW9CLEVBQUU7Z0NBQ3pCLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7NkJBQ3JCO3lCQUNEO3dCQUVELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQzt3QkFDeEMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFOzRCQUN6QixNQUFNLHVCQUF1QixHQUFHLGlCQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ2hELElBQUksdUJBQXVCLEVBQUU7Z0NBQzVCLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7NkJBQ3hCO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBRU0sd0JBQXdCLENBQUMsVUFBa0I7O1lBQ2pELE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLFNBQVM7bUJBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQzttQkFDcEIsVUFBVSxDQUFDLFdBQVcsS0FBSyxTQUFTO21CQUNwQyxVQUFVLENBQUMsV0FBVyxHQUFHLENBQUM7b0JBQzFCLE1BQUEsVUFBVSxDQUFDLFdBQVcsRUFBRSwwQ0FBRSxZQUFZLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1RCxDQUFDO1FBRU0scUJBQXFCLENBQUMsVUFBa0I7WUFDOUMsT0FBTyxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztRQUM1RSxDQUFDO0tBRUQ7SUFFWSxRQUFBLGVBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDIn0=