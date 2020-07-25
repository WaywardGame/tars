define(["require", "exports", "doodad/Doodads", "doodad/IDoodad", "utilities/enum/Enums"], function (require, exports, Doodads_1, IDoodad_1, Enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDoodadTypes = void 0;
    function getDoodadTypes(doodadTypeOrGroup) {
        const doodadTypes = [];
        if (doodadManager.isGroup(doodadTypeOrGroup)) {
            for (const dt of Enums_1.default.values(IDoodad_1.DoodadType)) {
                const doodadDescription = Doodads_1.default[dt];
                if (!doodadDescription) {
                    continue;
                }
                if (doodadManager.isInGroup(dt, doodadTypeOrGroup)) {
                    doodadTypes.push(dt);
                }
                const lit = doodadDescription.lit;
                if (lit !== undefined) {
                    const litDoodadDescription = Doodads_1.default[lit];
                    if (litDoodadDescription && doodadManager.isInGroup(lit, doodadTypeOrGroup)) {
                        doodadTypes.push(dt);
                    }
                }
                const revert = doodadDescription.revert;
                if (revert !== undefined) {
                    const revertDoodadDescription = Doodads_1.default[revert];
                    if (revertDoodadDescription && doodadManager.isInGroup(revert, doodadTypeOrGroup)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLFNBQWdCLGNBQWMsQ0FBQyxpQkFBK0M7UUFDN0UsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUM3QyxLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxFQUFFO2dCQUMxQyxNQUFNLGlCQUFpQixHQUFHLGlCQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDdkIsU0FBUztpQkFDVDtnQkFFRCxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7b0JBQ25ELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3JCO2dCQUVELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQztnQkFDbEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUN0QixNQUFNLG9CQUFvQixHQUFHLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzFDLElBQUksb0JBQW9CLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsRUFBRTt3QkFDNUUsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDckI7aUJBQ0Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2dCQUN4QyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3pCLE1BQU0sdUJBQXVCLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDaEQsSUFBSSx1QkFBdUIsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO3dCQUNsRixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNyQjtpQkFDRDthQUNEO1NBRUQ7YUFBTTtZQUNOLFdBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUNwQztRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7SUFuQ0Qsd0NBbUNDIn0=