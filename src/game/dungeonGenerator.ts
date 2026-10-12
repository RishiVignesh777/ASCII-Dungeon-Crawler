import { FloorData, Monster, GroundItem, Door } from '../types/game';

// Handcrafted layout for Floor 1 to guarantee a balanced, thrilling first floor
export function createFloor1(): FloorData {
  const baseGrid = [
    '####################',
    '#@...#.....#.......#',
    '#.##.#.###.#.#####.#',
    '#.#..#...#.#.#...#.#',
    '#.#..#.$...+.#...#.#',
    '#.####.###.#.###.#.#',
    '#....#...#.......#.#',
    '####.#...#########.#',
    '#....#...#.........#',
    '#.##+#####.#######.#',
    '#..#.....#.#.....#.#',
    '#..#.....#.#.###.#.#',
    '#..#####.#.#.#...#.#',
    '#......#.#.#.#...#.#',
    '######.#.#.#.#####.#',
    '#......#...#.......#',
    '#.####+#####.#####.#',
    '#.#..~...~.#.#.....#',
    '#.#........#.#...>.#',
    '####################',
  ];

  const monsters: Monster[] = [
    {
      id: 'm1_1',
      name: 'Goblin Scout',
      type: 'g',
      symbol: 'g',
      x: 4,
      y: 4,
      hp: 14,
      maxHp: 14,
      atk: 4,
      def: 1,
      exp: 15,
      gold: 12,
      alive: true,
      flavor: 'A twitchy green goblin with yellow fangs crouched in the passage.',
    },
    {
      id: 'm1_2',
      name: 'Crypt Skeleton',
      type: 'S',
      symbol: 'S',
      x: 15,
      y: 4,
      hp: 22,
      maxHp: 22,
      atk: 6,
      def: 2,
      exp: 28,
      gold: 20,
      alive: true,
      flavor: 'A clattering skeleton brandishing a rusted iron scythe.',
    },
    {
      id: 'm1_3',
      name: 'Goblin Prowler',
      type: 'g',
      symbol: 'g',
      x: 4,
      y: 18,
      hp: 16,
      maxHp: 16,
      atk: 5,
      def: 1,
      exp: 18,
      gold: 14,
      alive: true,
      flavor: 'A stealthy goblin skulking near the heat of bubbling lava fissures.',
    },
  ];

  const items: GroundItem[] = [
    {
      id: 'it1_gold',
      x: 7,
      y: 4,
      type: '$',
      name: 'Pile of Ancient Coins',
      value: 35,
      description: 'Glinting tarnished silver and gold coins scattered across the stone.',
    },
    {
      id: 'it1_key',
      x: 7,
      y: 7,
      type: 'K',
      name: 'Iron Cell Key',
      description: 'A heavy iron skeleton key stamped with an ancient dungeon seal.',
    },
    {
      id: 'it1_pot',
      x: 14,
      y: 10,
      type: 'P',
      name: 'Health Potion',
      value: 20,
      description: 'A glass vial brimming with effervescent ruby liquid.',
    },
    {
      id: 'it1_wep',
      x: 5,
      y: 11,
      type: 'W',
      name: 'Tempered Shortsword',
      weaponData: { name: 'Tempered Shortsword', damage: 6 },
      description: 'A finely balanced blade abandoned in an alcove (+6 DMG).',
    },
    {
      id: 'it1_arm',
      x: 9,
      y: 18,
      type: 'A',
      name: 'Studded Leather Vest',
      armorData: { name: 'Studded Leather Vest', defense: 4 },
      description: 'Hardened cuirass offering reliable protection (+4 DEF).',
    },
    {
      id: 'it1_shr',
      x: 15,
      y: 13,
      type: '?',
      name: 'Mysterious Lunar Shrine',
      value: 15,
      description: 'An ancient obsidian altar emitting soothing sapphire starlight.',
    },
    {
      id: 'it1_gold2',
      x: 16,
      y: 17,
      type: '$',
      name: 'Merchant Vault Gold',
      value: 50,
      description: 'A velvet bag packed with polished dungeon coins.',
    },
  ];

  const doors: Door[] = [
    {
      id: 'd1_1',
      x: 11,
      y: 4,
      isOpen: false,
      requiresKey: false,
      name: 'Wooden Plank Door',
    },
    {
      id: 'd1_2',
      x: 4,
      y: 9,
      isOpen: false,
      requiresKey: true,
      name: 'Heavy Locked Portcullis',
    },
    {
      id: 'd1_3',
      x: 6,
      y: 16,
      isOpen: false,
      requiresKey: false,
      name: 'Reinforced Arch Door',
    },
  ];

  return {
    floorNumber: 1,
    name: 'Floor 1: The Forgotten Dungeon Cell',
    themeDescription:
      'Cold moisture weeps from ancient stonework. Flickering wall torches reveal winding passages, rusted barred doors, and ominous scratching beyond.',
    baseGrid,
    playerStart: { x: 1, y: 1 },
    stairsPos: { x: 17, y: 18 },
    monsters,
    items,
    doors,
  };
}

// Procedural generator for Floor 2 and deeper
export function generateProceduralFloor(floorNumber: number): FloorData {
  // Generate 20x20 grid with rooms and corridors
  const grid: string[][] = Array.from({ length: 20 }, () =>
    Array.from({ length: 20 }, () => '#')
  );

  // Carve out 4 to 6 connected rectangular rooms
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const roomCount = 5 + (floorNumber % 2);

  for (let r = 0; r < roomCount; r++) {
    const w = Math.floor(Math.random() * 4) + 4;
    const h = Math.floor(Math.random() * 4) + 4;
    const x = Math.floor(Math.random() * (18 - w)) + 1;
    const y = Math.floor(Math.random() * (18 - h)) + 1;

    for (let iy = y; iy < y + h; iy++) {
      for (let ix = x; ix < x + w; ix++) {
        if (iy > 0 && iy < 19 && ix > 0 && ix < 19) {
          grid[iy][ix] = '.';
        }
      }
    }
    rooms.push({ x, y, w, h });
  }

  // Connect rooms with corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const r1 = rooms[i];
    const r2 = rooms[i + 1];

    let cx = Math.floor(r1.x + r1.w / 2);
    let cy = Math.floor(r1.y + r1.h / 2);
    const targetX = Math.floor(r2.x + r2.w / 2);
    const targetY = Math.floor(r2.y + r2.h / 2);

    while (cx !== targetX) {
      if (cx > 0 && cx < 19 && cy > 0 && cy < 19) grid[cy][cx] = '.';
      cx += cx < targetX ? 1 : -1;
    }
    while (cy !== targetY) {
      if (cx > 0 && cx < 19 && cy > 0 && cy < 19) grid[cy][cx] = '.';
      cy += cy < targetY ? 1 : -1;
    }
  }

  // Add lava hazards '~' on floor 2+
  const hazardCount = Math.min(8, floorNumber * 2 + 2);
  let hazardsPlaced = 0;
  for (let tries = 0; tries < 80 && hazardsPlaced < hazardCount; tries++) {
    const hx = Math.floor(Math.random() * 18) + 1;
    const hy = Math.floor(Math.random() * 18) + 1;
    if (grid[hy][hx] === '.') {
      grid[hy][hx] = '~';
      hazardsPlaced++;
    }
  }

  const playerStart = {
    x: Math.floor(rooms[0].x + rooms[0].w / 2),
    y: Math.floor(rooms[0].y + rooms[0].h / 2),
  };
  grid[playerStart.y][playerStart.x] = '.';

  const lastRoom = rooms[rooms.length - 1];
  const stairsPos = {
    x: Math.floor(lastRoom.x + lastRoom.w / 2),
    y: Math.floor(lastRoom.y + lastRoom.h / 2),
  };
  grid[stairsPos.y][stairsPos.x] = '.';

  // Helper to find empty floor tile
  const getEmptyTile = (): { x: number; y: number } => {
    for (let attempts = 0; attempts < 200; attempts++) {
      const rx = Math.floor(Math.random() * 18) + 1;
      const ry = Math.floor(Math.random() * 18) + 1;
      if (
        grid[ry][rx] === '.' &&
        (rx !== playerStart.x || ry !== playerStart.y) &&
        (rx !== stairsPos.x || ry !== stairsPos.y)
      ) {
        return { x: rx, y: ry };
      }
    }
    return { x: 2, y: 2 };
  };

  // Monsters
  const monsters: Monster[] = [];
  const monsterCount = 3 + floorNumber;

  // Boss Dragon on Floor 4 or multiples of 4
  if (floorNumber >= 3 && floorNumber % 3 === 0) {
    const bossPos = getEmptyTile();
    monsters.push({
      id: `m_boss_${floorNumber}`,
      name: 'Infernal Wyrm Dragon',
      type: 'D',
      symbol: 'D',
      x: bossPos.x,
      y: bossPos.y,
      hp: 75 + floorNumber * 15,
      maxHp: 75 + floorNumber * 15,
      atk: 14 + floorNumber * 2,
      def: 8 + floorNumber,
      exp: 150 + floorNumber * 50,
      gold: 250 + floorNumber * 50,
      alive: true,
      flavor: 'A titanic obsidian dragon with molten scales, exhaling clouds of sulfuric ash!',
    });
  }

  // Orcs, Skeletons, Goblins
  for (let m = 0; m < monsterCount; m++) {
    const pos = getEmptyTile();
    if (floorNumber >= 2 && m % 3 === 0) {
      monsters.push({
        id: `m_orc_${floorNumber}_${m}`,
        name: 'Bloodfang Orc',
        type: 'O',
        symbol: 'O',
        x: pos.x,
        y: pos.y,
        hp: 35 + floorNumber * 6,
        maxHp: 35 + floorNumber * 6,
        atk: 9 + floorNumber * 2,
        def: 4 + floorNumber,
        exp: 45 + floorNumber * 10,
        gold: 35 + floorNumber * 5,
        alive: true,
        flavor: 'A muscular green-skinned orc swinging a jagged battleaxe.',
      });
    } else if (m % 2 === 0) {
      monsters.push({
        id: `m_skel_${floorNumber}_${m}`,
        name: 'Tomb Skeleton',
        type: 'S',
        symbol: 'S',
        x: pos.x,
        y: pos.y,
        hp: 24 + floorNumber * 4,
        maxHp: 24 + floorNumber * 4,
        atk: 7 + floorNumber,
        def: 3 + floorNumber,
        exp: 30 + floorNumber * 8,
        gold: 22 + floorNumber * 4,
        alive: true,
        flavor: 'An armored skeleton rattling with dark necromantic malice.',
      });
    } else {
      monsters.push({
        id: `m_gob_${floorNumber}_${m}`,
        name: 'Dungeon Goblin',
        type: 'g',
        symbol: 'g',
        x: pos.x,
        y: pos.y,
        hp: 16 + floorNumber * 3,
        maxHp: 16 + floorNumber * 3,
        atk: 5 + floorNumber,
        def: 2,
        exp: 20 + floorNumber * 5,
        gold: 15 + floorNumber * 3,
        alive: true,
        flavor: 'A cackling goblin brandishing a poison-tipped dagger.',
      });
    }
  }

  // Items
  const items: GroundItem[] = [];

  // Key
  const keyPos = getEmptyTile();
  items.push({
    id: `item_key_${floorNumber}`,
    x: keyPos.x,
    y: keyPos.y,
    type: 'K',
    name: `Floor ${floorNumber} Vault Key`,
    description: 'An engraved brass key that opens secured portcullis doors.',
  });

  // Potions
  const pot1 = getEmptyTile();
  items.push({
    id: `item_pot_${floorNumber}_1`,
    x: pot1.x,
    y: pot1.y,
    type: 'P',
    name: 'Elixir of Vitality',
    value: 25 + floorNumber * 5,
    description: 'A shimmering flask restoring both wounds and spell mana.',
  });

  // Gold
  const goldPos = getEmptyTile();
  items.push({
    id: `item_gold_${floorNumber}`,
    x: goldPos.x,
    y: goldPos.y,
    type: '$',
    name: 'Loot Sack',
    value: 40 + floorNumber * 20,
    description: 'Gold nuggets and antique coinage from fallen adventurers.',
  });

  // Weapon upgrade
  const wepPos = getEmptyTile();
  const weaponNames = [
    'Rune-Etched Broadsword',
    'Sunfire Halberd',
    'Shadowblade Rapier',
    'Dragonbone Greatsword',
  ];
  const wepName = weaponNames[Math.min(weaponNames.length - 1, floorNumber - 1)];
  items.push({
    id: `item_wep_${floorNumber}`,
    x: wepPos.x,
    y: wepPos.y,
    type: 'W',
    name: wepName,
    weaponData: {
      name: wepName,
      damage: 7 + floorNumber * 3,
    },
    description: `A gleaming weapon forged for combat (+${7 + floorNumber * 3} DMG).`,
  });

  // Armor upgrade
  const armPos = getEmptyTile();
  const armorNames = [
    'Chainmail Hauberk',
    'Dwarven Plate Armor',
    'Dragonscale Cuirass',
  ];
  const armName = armorNames[Math.min(armorNames.length - 1, floorNumber - 2)];
  if (armName) {
    items.push({
      id: `item_arm_${floorNumber}`,
      x: armPos.x,
      y: armPos.y,
      type: 'A',
      name: armName,
      armorData: {
        name: armName,
        defense: 5 + floorNumber * 2,
      },
      description: `Protective armor shielding against crushing blows (+${5 + floorNumber * 2} DEF).`,
    });
  }

  // Mysterious Shrine
  const shrPos = getEmptyTile();
  items.push({
    id: `item_shr_${floorNumber}`,
    x: shrPos.x,
    y: shrPos.y,
    type: '?',
    name: 'Ancient Eldritch Shrine',
    value: 20 + floorNumber * 5,
    description: 'A stone obelisk carved with glowing glyphs of power.',
  });

  // Doors
  const doors: Door[] = [];
  const doorPos1 = getEmptyTile();
  doors.push({
    id: `door_${floorNumber}_1`,
    x: doorPos1.x,
    y: doorPos1.y,
    isOpen: false,
    requiresKey: true,
    name: `Reinforced Vault Portcullis`,
  });

  const baseGridStrings = grid.map((row) => row.join(''));

  const floorTitles = [
    'The Forgotten Dungeon Cell',
    'The Iron Catacombs',
    'The Molten Caverns',
    "The Dragon's Infernal Sanctum",
    'The Abyssal Vaults',
  ];

  return {
    floorNumber,
    name: `Floor ${floorNumber}: ${floorTitles[floorNumber - 1] || 'The Deep Labyrinth'}`,
    themeDescription:
      floorNumber >= 3
        ? 'Heat radiates from deep floor fissures as molten lava churns below. Ancient draconic roars vibrate through the cavernous obsidian walls!'
        : 'The smell of brimstone and cold iron fills the drafty hallways. Groans and ominous footsteps echo from unseen corridors ahead.',
    baseGrid: baseGridStrings,
    playerStart,
    stairsPos,
    monsters,
    items,
    doors,
  };
}
