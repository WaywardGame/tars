define(["require", "exports", "game/doodad/IDoodad", "utilities/math/Vector2", "../../../ITars", "../../../Objective", "../../Other/StartFire", "./AcquireBuildMoveToDoodad"], function (require, exports, IDoodad_1, Vector2_1, ITars_1, Objective_1, StartFire_1, AcquireBuildMoveToDoodad_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRmlyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0FjcXVpcmUvRG9vZGFkL0FjcXVpcmVCdWlsZE1vdmVUb0ZpcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBbUJBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLFdBQXlCO1lBQ3JELEtBQUssRUFBRSxDQUFDO1lBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBRXRELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLENBQUM7UUFDakMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE1BQTBCLENBQUM7WUFDL0IsSUFBSSxpQkFBMkQsQ0FBQztZQUVoRSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUNuQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osaUJBQWlCLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvRDthQUVEO2lCQUFNO2dCQUNOLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFFdkMsTUFBTSxXQUFXLEdBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztxQkFDbkYsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNkLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO3dCQUM3QixNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3pDLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ2pCLE9BQU8sU0FBUyxDQUFDO3lCQUNqQjt3QkFFRCxPQUFPOzRCQUNOLE1BQU0sRUFBRSxNQUFNOzRCQUNkLFlBQVksRUFBRSxXQUFXLENBQUMsWUFBWTt5QkFDdEMsQ0FBQztxQkFDRjtnQkFDRixDQUFDLENBQUM7cUJBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBc0Q7cUJBRW5HLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUU1RyxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtvQkFDckMsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDWixNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztxQkFDM0I7b0JBRUQsSUFBSSxVQUFVLENBQUMsWUFBWSxFQUFFO3dCQUM1QixNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQzt3QkFDM0IsTUFBTTtxQkFDTjtpQkFDRDtnQkFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLGlCQUFpQixHQUFHLHlCQUFlLENBQUMsV0FBVyxDQUFDO2lCQUNoRDthQUNEO1lBRUQsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQ0FBd0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDakU7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXZDLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQXBFRCx5Q0FvRUMifQ==