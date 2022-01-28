define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "utilities/enum/Enums", "game/doodad/DoodadManager"], function (require, exports, Doodads_1, IDoodad_1, Enums_1, DoodadManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DoodadUtilities = void 0;
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
            return (waterStill.decay !== undefined
                && waterStill.decay > 0
                && waterStill.gatherReady !== undefined
                && waterStill.gatherReady > 0
                && waterStill.description()?.providesFire) ? true : false;
        }
        isWaterStillDrinkable(waterStill) {
            return waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0;
        }
    }
    exports.DoodadUtilities = DoodadUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLE1BQWEsZUFBZTtRQUVwQixjQUFjLENBQUMsaUJBQStDLEVBQUUsbUJBQTZCO1lBQ25HLE1BQU0sV0FBVyxHQUFvQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQy9DLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDN0MsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsRUFBRTtvQkFDMUMsTUFBTSxpQkFBaUIsR0FBRyxpQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3ZCLFNBQVM7cUJBQ1Q7b0JBRUQsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsRUFBRTt3QkFDbkQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDO29CQUNsQyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7d0JBQ3RCLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDMUMsSUFBSSxvQkFBb0IsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsRUFBRTs0QkFDNUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDcEI7cUJBQ0Q7b0JBRUQsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO29CQUN4QyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7d0JBQ3pCLE1BQU0sdUJBQXVCLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSx1QkFBdUIsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBRTs0QkFDbEYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDcEI7cUJBQ0Q7aUJBQ0Q7YUFFRDtpQkFBTTtnQkFDTixXQUFXLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRW5DLElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE1BQU0saUJBQWlCLEdBQUcsaUJBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUNyRCxJQUFJLGlCQUFpQixFQUFFO3dCQUN0QixNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUM7d0JBQ2xDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTs0QkFDdEIsTUFBTSxvQkFBb0IsR0FBRyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUMxQyxJQUFJLG9CQUFvQixFQUFFO2dDQUN6QixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzZCQUNyQjt5QkFDRDt3QkFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7d0JBQ3hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDekIsTUFBTSx1QkFBdUIsR0FBRyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNoRCxJQUFJLHVCQUF1QixFQUFFO2dDQUM1QixXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzZCQUN4Qjt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1lBRUQsT0FBTyxXQUFXLENBQUM7UUFDcEIsQ0FBQztRQUVNLHdCQUF3QixDQUFDLFVBQWtCO1lBQ2pELE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLFNBQVM7bUJBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQzttQkFDcEIsVUFBVSxDQUFDLFdBQVcsS0FBSyxTQUFTO21CQUNwQyxVQUFVLENBQUMsV0FBVyxHQUFHLENBQUM7bUJBQzFCLFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDNUQsQ0FBQztRQUVNLHFCQUFxQixDQUFDLFVBQWtCO1lBQzlDLE9BQU8sVUFBVSxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUM7UUFDNUUsQ0FBQztLQUVEO0lBeEVELDBDQXdFQyJ9