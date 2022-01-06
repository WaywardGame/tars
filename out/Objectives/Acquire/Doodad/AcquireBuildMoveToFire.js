define(["require", "exports", "game/doodad/IDoodad", "utilities/math/Vector2", "../../../core/ITars", "../../../core/objective/Objective", "../../other/doodad/StartFire", "./AcquireBuildMoveToDoodad"], function (require, exports, IDoodad_1, Vector2_1, ITars_1, Objective_1, StartFire_1, AcquireBuildMoveToDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBuildMoveToFire extends Objective_1.default {
        constructor(baseInfoKey) {
            super();
            this.baseInfoKey = baseInfoKey;
        }
        getIdentifier() {
            return "AcquireBuildMoveToFire";
        }
        getStatus() {
            return `Acquiring fire`;
        }
        async execute(context) {
            const objectives = [];
            let doodad;
            let doodadTypeOrGroup;
            if (this.baseInfoKey !== undefined) {
                doodad = context.base[this.baseInfoKey][0];
                if (!doodad) {
                    doodadTypeOrGroup = ITars_1.baseInfo[this.baseInfoKey].doodadTypes[0];
                }
            }
            else {
                const position = context.getPosition();
                const doodadInfos = [context.base.campfire, context.base.kiln, context.base.furnace]
                    .map(doodads => {
                    for (const doodad of doodads) {
                        const description = doodad.description();
                        if (!description) {
                            return undefined;
                        }
                        return {
                            doodad: doodad,
                            providesFire: description.providesFire,
                        };
                    }
                })
                    .filter(doodadInfo => doodadInfo !== undefined)
                    .sort((a, b) => Vector2_1.default.squaredDistance(position, a.doodad) - Vector2_1.default.squaredDistance(position, b.doodad));
                for (const doodadInfo of doodadInfos) {
                    if (!doodad) {
                        doodad = doodadInfo.doodad;
                    }
                    if (doodadInfo.providesFire) {
                        doodad = doodadInfo.doodad;
                        break;
                    }
                }
                if (!doodad) {
                    doodadTypeOrGroup = IDoodad_1.DoodadTypeGroup.LitCampfire;
                }
            }
            if (doodadTypeOrGroup !== undefined) {
                objectives.push(new AcquireBuildMoveToDoodad_1.default(doodadTypeOrGroup));
            }
            objectives.push(new StartFire_1.default(doodad));
            return objectives;
        }
    }
    exports.default = AcquireBuildMoveToFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRmlyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FjcXVpcmUvZG9vZGFkL0FjcXVpcmVCdWlsZE1vdmVUb0ZpcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLFdBQXlCO1lBQ3JELEtBQUssRUFBRSxDQUFDO1lBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBRXRELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxNQUEwQixDQUFDO1lBQy9CLElBQUksaUJBQTJELENBQUM7WUFFaEUsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDbkMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLGlCQUFpQixHQUFHLGdCQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDL0Q7YUFFRDtpQkFBTTtnQkFDTixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRXZDLE1BQU0sV0FBVyxHQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7cUJBQ25GLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDZCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTt3QkFDN0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNqQixPQUFPLFNBQVMsQ0FBQzt5QkFDakI7d0JBRUQsT0FBTzs0QkFDTixNQUFNLEVBQUUsTUFBTTs0QkFDZCxZQUFZLEVBQUUsV0FBVyxDQUFDLFlBQVk7eUJBQ3RDLENBQUM7cUJBQ0Y7Z0JBQ0YsQ0FBQyxDQUFDO3FCQUNELE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQXNEO3FCQUVuRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLGlCQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFFNUcsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7cUJBQzNCO29CQUVELElBQUksVUFBVSxDQUFDLFlBQVksRUFBRTt3QkFDNUIsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7d0JBQzNCLE1BQU07cUJBQ047aUJBQ0Q7Z0JBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixpQkFBaUIsR0FBRyx5QkFBZSxDQUFDLFdBQVcsQ0FBQztpQkFDaEQ7YUFDRDtZQUVELElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksa0NBQXdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2FBQ2pFO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUV2QyxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF4RUQseUNBd0VDIn0=