define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "utilities/enum/Enums"], function (require, exports, Doodads_1, IDoodad_1, Enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWaterStillDrinkable = exports.isWaterStillDesalinating = exports.getDoodadTypes = void 0;
    function getDoodadTypes(doodadTypeOrGroup) {
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
    exports.getDoodadTypes = getDoodadTypes;
    function isWaterStillDesalinating(waterStill) {
        var _a;
        return (waterStill.decay !== undefined
            && waterStill.decay > 0
            && waterStill.gatherReady !== undefined
            && waterStill.gatherReady > 0
            && ((_a = waterStill.description()) === null || _a === void 0 ? void 0 : _a.providesFire)) ? true : false;
    }
    exports.isWaterStillDesalinating = isWaterStillDesalinating;
    function isWaterStillDrinkable(waterStill) {
        return waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0;
    }
    exports.isWaterStillDrinkable = isWaterStillDrinkable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLFNBQWdCLGNBQWMsQ0FBQyxpQkFBK0M7UUFDN0UsTUFBTSxXQUFXLEdBQW9CLElBQUksR0FBRyxFQUFFLENBQUM7UUFDL0MsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDN0MsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsRUFBRTtnQkFDMUMsTUFBTSxpQkFBaUIsR0FBRyxpQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3ZCLFNBQVM7aUJBQ1Q7Z0JBRUQsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO29CQUNuRCxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNwQjtnQkFFRCxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUM7Z0JBQ2xDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtvQkFDdEIsTUFBTSxvQkFBb0IsR0FBRyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLG9CQUFvQixJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEVBQUU7d0JBQzVFLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3BCO2lCQUNEO2dCQUVELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztnQkFDeEMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUN6QixNQUFNLHVCQUF1QixHQUFHLGlCQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2hELElBQUksdUJBQXVCLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBRTt3QkFDbEYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Q7YUFDRDtTQUVEO2FBQU07WUFDTixXQUFXLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDbkM7UUFFRCxPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBbkNELHdDQW1DQztJQUVELFNBQWdCLHdCQUF3QixDQUFDLFVBQWtCOztRQUMxRCxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxTQUFTO2VBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQztlQUNwQixVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVM7ZUFDcEMsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDO2dCQUMxQixNQUFBLFVBQVUsQ0FBQyxXQUFXLEVBQUUsMENBQUUsWUFBWSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDNUQsQ0FBQztJQU5ELDREQU1DO0lBRUQsU0FBZ0IscUJBQXFCLENBQUMsVUFBa0I7UUFDdkQsT0FBTyxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRkQsc0RBRUMifQ==