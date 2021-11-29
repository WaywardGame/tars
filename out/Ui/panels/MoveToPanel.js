var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/entity/npc/INPCs", "game/doodad/IDoodad", "game/tile/ITerrain", "ui/component/Button", "ui/component/Divider", "ui/component/dropdown/DoodadDropdown", "ui/component/dropdown/IslandDropdown", "ui/component/dropdown/PlayerDropdown", "ui/component/dropdown/TerrainDropdown", "ui/component/dropdown/NPCDropdown", "ui/component/LabelledRow", "utilities/Decorators", "../../ITars", "../../mode/modes/MoveTo", "../components/TarsPanel"], function (require, exports, INPCs_1, IDoodad_1, ITerrain_1, Button_1, Divider_1, DoodadDropdown_1, IslandDropdown_1, PlayerDropdown_1, TerrainDropdown_1, NPCDropdown_1, LabelledRow_1, Decorators_1, ITars_1, MoveTo_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b, _c, _d, _e;
            super();
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToBase))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Base,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelIsland)))
                .append(this.dropdownIsland = new IslandDropdown_1.default((_a = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToIslandDropdown]) !== null && _a !== void 0 ? _a : localIsland.id)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToIsland))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Island,
                    islandId: this.dropdownIsland.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.dropdownPlayer = new PlayerDropdown_1.default("");
            (_b = this.dropdownPlayer.options.get(localPlayer.identifier)) === null || _b === void 0 ? void 0 : _b.setDisabled(true);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelPlayer)))
                .append(this.dropdownPlayer)
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToPlayer))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Player,
                    playerIdentifier: this.dropdownPlayer.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodad = new DoodadDropdown_1.default((_c = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToDoodadDropdown]) !== null && _c !== void 0 ? _c : IDoodad_1.DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToDoodad))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Doodad,
                    doodadType: this.dropdownDoodad.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelTerrain)))
                .append(this.dropdownTerrainType = new TerrainDropdown_1.default((_d = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToTerrainDropdown]) !== null && _d !== void 0 ? _d : ITerrain_1.TerrainType.Grass)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToTerrain))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Terrain,
                    terrainType: this.dropdownTerrainType.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelNPC)))
                .append(this.dropdownNPC = new NPCDropdown_1.default((_e = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToNPCDropdown]) !== null && _e !== void 0 ? _e : INPCs_1.NPCType.Merchant)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToNPCDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToNPC))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.NPC,
                    npcType: this.dropdownNPC.selection,
                }));
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelMoveTo;
        }
        onSwitchTo() {
        }
        refresh() {
        }
    }
    __decorate([
        Decorators_1.Bound
    ], MoveToPanel.prototype, "refresh", null);
    exports.default = MoveToPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdWkvcGFuZWxzL01vdmVUb1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW1CQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFROUM7O1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsMEJBQWtCLEVBQUMsdUJBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2lCQUNuRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDcEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksbUJBQVUsQ0FBQztvQkFDOUMsSUFBSSxFQUFFLG1CQUFVLENBQUMsSUFBSTtpQkFDeEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLGlCQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0IsSUFBSSx5QkFBVyxFQUFFO2lCQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7aUJBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBQSwwQkFBa0IsRUFBQyx1QkFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSx3QkFBYyxDQUFDLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLG9CQUFvQixDQUFDLG1DQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUM7aUJBQzVILEtBQUssQ0FBQyxTQUFTLENB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