# TARS
Let TARS play the game for you. Good thing there are no black holes in Wayward.

TARS is a bot that will play Wayward by itself, doing tasks such as gathering resources, setting up a camp, hunting, getting food/water, and more! It's named after the robot from Interstellar.

By default, press `T` to open the TARS dialog or press `Shift + T` to immediately enable / disable TARS.

## Steam Workshop

Subscribe to the mod on the Steam Workshop to use it.

[http://steamcommunity.com/sharedfiles/filedetails/?id=1218286592](http://steamcommunity.com/sharedfiles/filedetails/?id=1218286592)

## Overview

TARS is a practical application of [AI planning](https://en.wikipedia.org/wiki/Automated_planning_and_scheduling). This means that when TARS wants to "Acquire a Copper Sword", it will gather every item & prerequisite in order to do so - it will build a kiln, furnace, acquire copper ore, smelt bars, etc.

Here is a brief list of objectives TARS will complete as it's running:

1. Acquire an item that it can use to gather with
1. Build a campfire
1. Acquire an item that can start fires
1. Acquire kindling
1. Acquire tinder
1. Acquire a shovel
1. Acquire a knife
1. Acquire a sword
1. Acquire an axe
1. Replace tattered shirt with a bark tunic
1. Replace tattered pants with bark leggings
1. Acquire an wooden shield
1. Build a water still
1. Build wooden chests near the campfire / base when running out of room
1. Acquire a pick axe
1. Acquire a hammer
1. Acquire tongs
1. Start desalinating water in the water still when near the base
1. Plant seeds from the inventory when near the base
1. Build a kiln
1. Acquire an item to heal with, which will be held in the inventory for later use
1. Acquire / upgrade a full set of leather equipment
1. Build a well if an unlimited water source is available near the base
1. Build a furnace
1. Build an anvil
1. Acquire an extra water container
1. Build another water still
1. Acquire food to hold in inventory for later use
1. Acquire a bandage to hold in inventory for later use
1. Fill extra water container to hold in inventory for later use
1. Pickup items on the ground around the base and place them into chests
1. Reinforce weapons / armor that have low durabiltiy
1. Upgrade existing sword, shield, leather armor, and gathering equipment to better items
1. Stock up on food & water, build a sailboat, and move to another island

In between running objectives, it may pause to process an interrupt. Here are a few of the interrupts:

1. Defend against nearby creatures by choosing the best available weapon to use against it.
1. Run away from creatures if we may die from it
1. Check for and carve nearby creature corpses
1. Acquire & build healing items when health is low
1. Drink from water sources / use water stills when thristy
1. Acquire food & eat when hungry
1. Repair items that are running low on durability
1. Return to the base to put items into chests if theres too many items in the inventory

## Cloning/Setup:
```
git clone https://github.com/WaywardGame/tars.git
cd tars
On Windows: path/to/wayward/install/wayward.cmd +mod update .
On macOS: path/to/wayward/install/Wayward.app/Contents/MacOS/Electron +mod update .
On Linux: path/to/wayward/install/wayward +mod update .p
```

## Building:
Open the folder in Visual Studio Code and build with `Ctrl+Shift+B`.

## Screenshots
![TARS](https://raw.githubusercontent.com/WaywardGame/tars/master/mod.png "TARS")

![Screenshot #1](https://steamuserimages-a.akamaihd.net/ugc/914673076759393814/8BA90395A7E4E6AEB28C5FEB6EC32A532864D3B6/ "Screenshot #1")

![Screenshot #2](https://steamuserimages-a.akamaihd.net/ugc/914673076759393836/147FEFC71A6182CDB23F1EFF8E9E9C13F04DD225/ "Screenshot #2")

![Screenshot #3](https://steamuserimages-a.akamaihd.net/ugc/914673076759393844/AC6C0AEE19C47E99A36B3E817742C1FCE089B910/ "Screenshot #3")

## References

- https://en.wikipedia.org/wiki/Automated_planning_and_scheduling
- https://en.wikipedia.org/wiki/Backward_chaining
- https://en.wikipedia.org/wiki/Backward_induction
- https://en.wikipedia.org/wiki/Game_tree
 