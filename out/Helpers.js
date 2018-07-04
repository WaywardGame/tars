define(["require", "exports", "doodad/Doodads", "Enums", "utilities/enum/Enums"], function (require, exports, Doodads_1, Enums_1, Enums_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let path;
    function getPath() {
        return path;
    }
    exports.getPath = getPath;
    function setPath(p) {
        path = p;
    }
    exports.setPath = setPath;
    function getDoodadTypes(doodadTypeOrGroup) {
        const doodadTypes = [];
        if (doodadManager.isDoodadTypeGroup(doodadTypeOrGroup)) {
            for (const dt of Enums_2.default.values(Enums_1.DoodadType)) {
                const doodadDescription = Doodads_1.default[dt];
                if (!doodadDescription) {
                    continue;
                }
                if (doodadDescription.group === doodadTypeOrGroup) {
                    doodadTypes.push(dt);
                }
                const lit = doodadDescription.lit;
                if (lit !== undefined) {
                    const litDoodadDescription = Doodads_1.default[lit];
                    if (litDoodadDescription && litDoodadDescription.group === doodadTypeOrGroup) {
                        doodadTypes.push(dt);
                    }
                }
                const revert = doodadDescription.revert;
                if (revert !== undefined) {
                    const revertDoodadDescription = Doodads_1.default[revert];
                    if (revertDoodadDescription && revertDoodadDescription.group === doodadTypeOrGroup) {
                        doodadTypes.push(dt);
                    }
                }
            }
        }
        else {
            doodadTypes.push(doodadTypeOrGroup);
        }
        return doodadTypes;
    }
    exports.getDoodadTypes = getDoodadTypes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9IZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUlBLElBQUksSUFBWSxDQUFDO0lBRWpCO1FBQ0MsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRkQsMEJBRUM7SUFFRCxpQkFBd0IsQ0FBUztRQUNoQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUZELDBCQUVDO0lBRUQsd0JBQStCLGlCQUErQztRQUM3RSxNQUFNLFdBQVcsR0FBaUIsRUFBRSxDQUFDO1FBRXJDLElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDdkQsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFVLENBQUMsRUFBRTtnQkFDMUMsTUFBTSxpQkFBaUIsR0FBRyxpQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3ZCLFNBQVM7aUJBQ1Q7Z0JBRUQsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLEtBQUssaUJBQWlCLEVBQUU7b0JBQ2xELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3JCO2dCQUVELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQztnQkFDbEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUN0QixNQUFNLG9CQUFvQixHQUFHLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzFDLElBQUksb0JBQW9CLElBQUksb0JBQW9CLENBQUMsS0FBSyxLQUFLLGlCQUFpQixFQUFFO3dCQUM3RSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNyQjtpQkFDRDtnQkFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7Z0JBQ3hDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDekIsTUFBTSx1QkFBdUIsR0FBRyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoRCxJQUFJLHVCQUF1QixJQUFJLHVCQUF1QixDQUFDLEtBQUssS0FBSyxpQkFBaUIsRUFBRTt3QkFDbkYsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDckI7aUJBQ0Q7YUFDRDtTQUVEO2FBQU07WUFDTixXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDcEM7UUFFRCxPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBcENELHdDQW9DQyJ9