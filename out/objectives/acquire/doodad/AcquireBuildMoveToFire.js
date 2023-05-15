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
                const tile = context.getTile();
                const doodadInfos = [context.base.campfire, context.base.kiln, context.base.furnace]
                    .map(doodads => {
                    for (const doodad of doodads) {
                        const description = doodad.description;
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
                    .sort((a, b) => Vector2_1.default.squaredDistance(tile, a.doodad) - Vector2_1.default.squaredDistance(tile, b.doodad));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRmlyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FjcXVpcmUvZG9vZGFkL0FjcXVpcmVCdWlsZE1vdmVUb0ZpcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBdUJILE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLFdBQXlCO1lBQ3JELEtBQUssRUFBRSxDQUFDO1lBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBRXRELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxNQUEwQixDQUFDO1lBQy9CLElBQUksaUJBQTJELENBQUM7WUFFaEUsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDbkMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLGlCQUFpQixHQUFHLGdCQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDL0Q7YUFFRDtpQkFBTTtnQkFDTixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRS9CLE1BQU0sV0FBVyxHQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7cUJBQ25GLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDZCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTt3QkFDN0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQzt3QkFDdkMsSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDakIsT0FBTyxTQUFTLENBQUM7eUJBQ2pCO3dCQUVELE9BQU87NEJBQ04sTUFBTSxFQUFFLE1BQU07NEJBQ2QsWUFBWSxFQUFFLFdBQVcsQ0FBQyxZQUFZO3lCQUN0QyxDQUFDO3FCQUNGO2dCQUNGLENBQUMsQ0FBQztxQkFDRCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFzRDtxQkFFbkcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBRXBHLEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO29CQUNyQyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO3FCQUMzQjtvQkFFRCxJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUU7d0JBQzVCLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO3dCQUMzQixNQUFNO3FCQUNOO2lCQUNEO2dCQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osaUJBQWlCLEdBQUcseUJBQWUsQ0FBQyxXQUFXLENBQUM7aUJBQ2hEO2FBQ0Q7WUFFRCxJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGtDQUF3QixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQzthQUNqRTtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFdkMsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBeEVELHlDQXdFQyJ9