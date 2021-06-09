define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "utilities/enum/Enums"], function (require, exports, Doodads_1, IDoodad_1, Enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.doodadUtilities = void 0;
    class DoodadUtilities {
        getDoodadTypes(doodadTypeOrGroup) {
            const doodadTypes = new Set();
            if (doodadManager.isGroup(doodadTypeOrGroup)) {
                for (const dt of Enums_1.default.values(IDoodad_1.DoodadType)) {
                    const doodadDescription = Doodads_1.default[dt];
                    if (!doodadDescription) {
                        continue;
                    }
                    if (doodadManager.isInGroup(dt, doodadTypeOrGroup)) {
                        doodadTypes.add(dt);
                    }
                    const lit = doodadDescription.lit;
                    if (lit !== undefined) {
                        const litDoodadDescription = Doodads_1.default[lit];
                        if (litDoodadDescription && doodadManager.isInGroup(lit, doodadTypeOrGroup)) {
                            doodadTypes.add(dt);
                        }
                    }
                    const revert = doodadDescription.revert;
                    if (revert !== undefined) {
                        const revertDoodadDescription = Doodads_1.default[revert];
                        if (revertDoodadDescription && doodadManager.isInGroup(revert, doodadTypeOrGroup)) {
                            doodadTypes.add(dt);
                        }
                    }
                }
            }
            else {
                doodadTypes.add(doodadTypeOrGroup);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLE1BQU0sZUFBZTtRQUViLGNBQWMsQ0FBQyxpQkFBK0M7WUFDcEUsTUFBTSxXQUFXLEdBQW9CLElBQUksR0FBRyxFQUFFLENBQUM7WUFDL0MsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQzdDLEtBQUssTUFBTSxFQUFFLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLEVBQUU7b0JBQzFDLE1BQU0saUJBQWlCLEdBQUcsaUJBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUN2QixTQUFTO3FCQUNUO29CQUVELElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsRUFBRTt3QkFDbkQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDO29CQUNsQyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7d0JBQ3RCLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDMUMsSUFBSSxvQkFBb0IsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFOzRCQUM1RSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUNwQjtxQkFDRDtvQkFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7b0JBQ3hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTt3QkFDekIsTUFBTSx1QkFBdUIsR0FBRyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoRCxJQUFJLHVCQUF1QixJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7NEJBQ2xGLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQ3BCO3FCQUNEO2lCQUNEO2FBRUQ7aUJBQU07Z0JBQ04sV0FBVyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsT0FBTyxXQUFXLENBQUM7UUFDcEIsQ0FBQztRQUVNLHdCQUF3QixDQUFDLFVBQWtCOztZQUNqRCxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxTQUFTO21CQUNsQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUM7bUJBQ3BCLFVBQVUsQ0FBQyxXQUFXLEtBQUssU0FBUzttQkFDcEMsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDO29CQUMxQixNQUFBLFVBQVUsQ0FBQyxXQUFXLEVBQUUsMENBQUUsWUFBWSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDNUQsQ0FBQztRQUVNLHFCQUFxQixDQUFDLFVBQWtCO1lBQzlDLE9BQU8sVUFBVSxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUM7UUFDNUUsQ0FBQztLQUVEO0lBRVksUUFBQSxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9