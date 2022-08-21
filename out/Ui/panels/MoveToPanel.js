var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/entity/npc/INPCs", "game/doodad/IDoodad", "game/island/IIsland", "game/tile/ITerrain", "ui/component/Button", "ui/component/Divider", "ui/component/dropdown/DoodadDropdown", "ui/component/dropdown/IslandDropdown", "ui/component/dropdown/CreatureDropdown", "ui/component/dropdown/PlayerDropdown", "ui/component/dropdown/TerrainDropdown", "ui/component/dropdown/NPCTypeDropdown", "ui/component/LabelledRow", "utilities/Decorators", "../../modes/MoveTo", "../components/TarsPanel", "../../ITarsMod", "game/entity/creature/ICreature"], function (require, exports, INPCs_1, IDoodad_1, IIsland_1, ITerrain_1, Button_1, Divider_1, DoodadDropdown_1, IslandDropdown_1, CreatureDropdown_1, PlayerDropdown_1, TerrainDropdown_1, NPCTypeDropdown_1, LabelledRow_1, Decorators_1, MoveTo_1, TarsPanel_1, ITarsMod_1, ICreature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToBase))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Base,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelIsland)))
                .append(this.dropdownIsland = new IslandDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToIslandDropdown] ?? localIsland?.id ?? IIsland_1.DEFAULT_ISLAND_ID)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToIsland))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Island,
                    islandId: this.dropdownIsland.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.dropdownPlayer = new PlayerDropdown_1.default();
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelPlayer)))
                .append(this.dropdownPlayer)
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToPlayer))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Player,
                    playerIdentifier: this.dropdownPlayer.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodad = new DoodadDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToDoodadDropdown] ?? IDoodad_1.DoodadType.GraniteCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToDoodad))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Doodad,
                    doodadType: this.dropdownDoodad.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelTerrain)))
                .append(this.dropdownTerrainType = new TerrainDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToTerrainDropdown] ?? ITerrain_1.TerrainType.Grass)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToTerrain))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Terrain,
                    terrainType: this.dropdownTerrainType.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelCreature)))
                .append(this.dropdownCreature = new CreatureDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToCreatureDropdown] ?? ICreature_1.CreatureType.Rabbit)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToCreatureDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToCreature))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Creature,
                    creatureType: this.dropdownCreature.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelNPC)))
                .append(this.dropdownNPC = new NPCTypeDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToNPCTypeDropdown] ?? INPCs_1.NPCType.Merchant)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToNPCTypeDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToNPC))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.NPC,
                    npcType: this.dropdownNPC.selection,
                }));
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelMoveTo;
        }
        onSwitchTo() {
            const events = playerManager.event.until(this, "switchAway", "remove");
            events.subscribe("join", this.refresh);
            events.subscribe("leave", this.refresh);
        }
        refresh() {
            this.dropdownPlayer.refresh();
        }
    }
    __decorate([
        Decorators_1.Bound
    ], MoveToPanel.prototype, "refresh", null);
    exports.default = MoveToPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdWkvcGFuZWxzL01vdmVUb1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQXNCQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFTOUMsWUFBWSxZQUFrQjtZQUMxQixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFcEIsSUFBSSxnQkFBTSxFQUFFO2lCQUNQLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsc0JBQXNCLENBQUMsQ0FBQztpQkFDbkUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLG1CQUFVLENBQUM7b0JBQ3RELElBQUksRUFBRSxtQkFBVSxDQUFDLElBQUk7aUJBQ3hCLENBQUMsQ0FBQyxDQUFDO2dCQUNKLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQztpQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxpQkFBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdCLElBQUkseUJBQVcsRUFBRTtpQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO2lCQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZGLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsNEJBQWlCLENBQUMsb0JBQW9CLENBQUMsSUFBSSxXQUFXLEVBQUUsRUFBRSxJQUFJLDJCQUFpQixD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