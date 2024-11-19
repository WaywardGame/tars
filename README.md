# TARS
Let TARS play the game for you. Good thing there are no black holes in Wayward.

TARS is a bot that will play Wayward by itself, doing tasks such as gathering resources, setting up a camp, hunting, getting food/water, and more! It's named after the robot from Interstellar.

By default, press `HOME` to open the TARS dialog or press `PAUSE` to immediately enable / disable TARS.

## Steam Workshop

Subscribe to the mod on the Steam Workshop to use it.

[https://steamcommunity.com/sharedfiles/filedetails/?id=1218286592](https://steamcommunity.com/sharedfiles/filedetails/?id=1218286592)

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

![Screenshot #1](https://steamuserimages-a.akamaihd.net/ugc/1765954876790907179/DE91BDA9541B396706AF9A85DB8A99E64ABEB6E7/ "Screenshot #1")

![Screenshot #2](https://steamuserimages-a.akamaihd.net/ugc/1765954876790907515/05230A57F2B7C5A1AA27291E3213544CEE6A43BF/ "Screenshot #2")

![Screenshot #3](https://steamuserimages-a.akamaihd.net/ugc/1765954876790907924/9B380053FF3B253DA3249351855FF70AF3B2F247/ "Screenshot #3")

![Screenshot #4](https://steamuserimages-a.akamaihd.net/ugc/1765954876790907929/09D5D83B02E3E4DB9D26EDD48C9A6F4E36B891EA/ "Screenshot #4")

![Screenshot #5](https://steamuserimages-a.akamaihd.net/ugc/1765954876790907934/C929F4168CD10E27C6322DE3BE83B874E46BD6FE/ "Screenshot #5")

## References

- https://en.wikipedia.org/wiki/Automated_planning_and_scheduling
- https://en.wikipedia.org/wiki/Backward_chaining
- https://en.wikipedia.org/wiki/Backward_induction
- https://en.wikipedia.org/wiki/Game_tree
 