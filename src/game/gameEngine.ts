import { DungeonLevel, GameTurn, Monster, Chest, Trap, Door, PlayerStats } from '../types/game';
import { DUNGEON_LEVELS } from './dungeonLevels';

export interface GameState {
  levelIndex: number;
  playerPos: { x: number; y: number };
  playerStats: PlayerStats;
  monsters: Monster[];
  chests: Chest[];
  traps: Trap[];
  doors: Door[];
  turns: GameTurn[];
  turnCount: number;
  gameOver: boolean;
  gameWon: boolean;
  currentCombatLog?: string;
}

export function createInitialGameState(): GameState {
  const level = DUNGEON_LEVELS[0];
  const initialStats: PlayerStats = {
    hp: 24,
    maxHp: 24,
    gold: 0,
    weapon: {
      name: 'Rusty Iron Shiv',
      atkBonus: 3,
    },
    inventory: ['Lesser Health Potion', 'Old Brass Key'],
  };

  const initialPos = { ...level.playerStart };
  const initialMonsters = JSON.parse(JSON.stringify(level.monsters));
  const initialChests = JSON.parse(JSON.stringify(level.chests));
  const initialTraps = JSON.parse(JSON.stringify(level.traps));
  const initialDoors = JSON.parse(JSON.stringify(level.doors));

  const state: GameState = {
    levelIndex: 0,
    playerPos: initialPos,
    playerStats: initialStats,
    monsters: initialMonsters,
    chests: initialChests,
    traps: initialTraps,
    doors: initialDoors,
    turns: [],
    turnCount: 1,
    gameOver: false,
    gameWon: false,
  };

  const firstTurn = generateTurn(state, undefined, level.startDescription);
  state.turns = [firstTurn];

  return state;
}

export function renderAsciiMap(
  level: DungeonLevel,
  playerPos: { x: number; y: number },
  monsters: Monster[],
  chests: Chest[],
  traps: Trap[],
  doors: Door[]
): string {
  // Construct 12x12 grid based on base layout
  const grid: string[][] = Array.from({ length: 12 }, (_, y) => {
    const row = level.baseGrid[y] || '############';
    return row.split('');
  });

  // Clear baseline entity markers if any in template and replace with floor
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      if (grid[y][x] === '@' || grid[y][x] === 'M' || grid[y][x] === '$' || grid[y][x] === '^') {
        grid[y][x] = '.';
      }
    }
  }

  // Draw doors
  doors.forEach((door) => {
    if (door.y >= 0 && door.y < 12 && door.x >= 0 && door.x < 12) {
      grid[door.y][door.x] = '+';
    }
  });

  // Draw traps (active traps show as '^', disarmed or triggered as '.')
  traps.forEach((trap) => {
    if (trap.y >= 0 && trap.y < 12 && trap.x >= 0 && trap.x < 12) {
      grid[trap.y][trap.x] = trap.disarmed || trap.triggered ? '.' : '^';
    }
  });

  // Draw chests (unopened as '$', opened as '.')
  chests.forEach((chest) => {
    if (chest.y >= 0 && chest.y < 12 && chest.x >= 0 && chest.x < 12) {
      grid[chest.y][chest.x] = chest.opened ? '.' : '$';
    }
  });

  // Draw living monsters
  monsters.forEach((monster) => {
    if (monster.alive && monster.y >= 0 && monster.y < 12 && monster.x >= 0 && monster.x < 12) {
      grid[monster.y][monster.x] = 'M';
    }
  });

  // Draw player '@'
  if (playerPos.y >= 0 && playerPos.y < 12 && playerPos.x >= 0 && playerPos.x < 12) {
    grid[playerPos.y][playerPos.x] = '@';
  }

  return grid.map((row) => row.join('')).join('\n');
}

export function generateTurn(
  state: GameState,
  actionTaken?: string,
  customScene?: string,
  combatLog?: string
): GameTurn {
  const currentLevel = DUNGEON_LEVELS[state.levelIndex];
  const mapAscii = renderAsciiMap(
    currentLevel,
    state.playerPos,
    state.monsters,
    state.chests,
    state.traps,
    state.doors
  );

  const statusBoard = {
    hp: `${state.playerStats.hp}/${state.playerStats.maxHp}`,
    gold: state.playerStats.gold,
    weapon: `${state.playerStats.weapon.name} (+${state.playerStats.weapon.atkBonus} ATK)`,
    inventory: [...state.playerStats.inventory],
  };

  // Determine dynamic scene description
  let sceneDescription = customScene || '';
  if (!sceneDescription) {
    sceneDescription = buildSceneDescription(state, currentLevel, combatLog);
  }

  // Determine 3 to 4 logical choices
  const actions = determineActions(state, currentLevel);

  return {
    turnNumber: state.turnCount,
    mapAscii,
    statusBoard,
    sceneDescription,
    actions,
    combatEvent: combatLog,
    actionTaken,
    timestamp: Date.now(),
  };
}

function buildSceneDescription(state: GameState, level: DungeonLevel, combatLog?: string): string {
  if (state.gameOver) {
    return 'Your vision fades as darkness claims the dungeon. Your battered body collapses onto the cold stone floor, joining the forgotten bones of adventurers who came before you.';
  }

  if (state.gameWon) {
    return 'With the final dungeon threat vanquished, daylight pours through an ancient archway ahead. You emerge victorious from the forgotten labyrinth, your pack laden with riches and legendary glory!';
  }

  const { x, y } = state.playerPos;

  // Check adjacent monsters
  const adjMonster = state.monsters.find(
    (m) => m.alive && Math.abs(m.x - x) + Math.abs(m.y - y) === 1
  );

  if (adjMonster) {
    return `A snarling ${adjMonster.name} lunges in the dim torchlight just paces ahead! Its menacing gaze fixes upon you, ready to strike at the slightest twitch.`;
  }

  // Check adjacent chests
  const adjChest = state.chests.find(
    (c) => !c.opened && Math.abs(c.x - x) + Math.abs(c.y - y) === 1
  );
  if (adjChest) {
    return `In the gloom beside you rests an untouched treasure chest, its iron lock glinting faintly. The dungeon whispers with quiet tension as you inspect the lock.`;
  }

  // Check adjacent doors
  const adjDoor = state.doors.find(
    (d) => Math.abs(d.x - x) + Math.abs(d.y - y) === 1
  );
  if (adjDoor) {
    return `You stand before a ${adjDoor.name}. Cold air seeps through the crevice between stone and iron, carrying the faint murmur of whatever lurks beyond.`;
  }

  // Check if just won combat
  if (combatLog && combatLog.includes('slain')) {
    return 'The beast collapses in a heap, its dark blood seeping into the stone floor cracks. A brief, eerie calm returns to the damp dungeon corridor.';
  }

  // Check trap triggered
  if (combatLog && combatLog.includes('trap')) {
    return 'Mechanical gears click ominously beneath your boots as hidden spikes shoot outward! Pain jolts through your limbs before the mechanism resets.';
  }

  // Positional ambience
  const cellSurroundings = [
    'Water drips rhythmically from crumbling ceiling stones into dark puddles. Faint draft flutters the dying torch embers along the mossy dungeon walls.',
    'Cobwebs drift lazily between stone arches as the silence of ancient catacombs presses heavily against your ears.',
    'Scattered shards of ancient pottery and rusted chains litter the flagstones. Shadows dance across the 12-pace chamber as you advance.',
  ];

  return cellSurroundings[(state.turnCount + x + y) % cellSurroundings.length];
}

function determineActions(state: GameState, level: DungeonLevel): string[] {
  if (state.gameOver) {
    return ['Restart Adventure', 'View Run Summary', 'Try Different Route'];
  }

  if (state.gameWon) {
    return ['Start New Delve', 'Celebrate Victory', 'Ascend to Surface'];
  }

  const actions: string[] = [];
  const { x, y } = state.playerPos;

  // 1. Monster attack if adjacent
  const adjMonster = state.monsters.find(
    (m) => m.alive && Math.abs(m.x - x) + Math.abs(m.y - y) === 1
  );
  if (adjMonster) {
    actions.push(`Attack ${adjMonster.name}`);
  }

  // 2. Chest open if adjacent or standing on it
  const adjChest = state.chests.find(
    (c) => !c.opened && Math.abs(c.x - x) + Math.abs(c.y - y) <= 1
  );
  if (adjChest) {
    actions.push('Open treasure chest');
  }

  // 3. Door interaction if adjacent
  const adjDoor = state.doors.find(
    (d) => Math.abs(d.x - x) + Math.abs(d.y - y) === 1
  );
  if (adjDoor) {
    if (adjDoor.locked) {
      actions.push(`Unlock ${adjDoor.name}`);
    } else {
      actions.push(`Pass through ${adjDoor.name}`);
    }
  }

  // 4. Movement options
  const directions = [
    { name: 'North', dx: 0, dy: -1 },
    { name: 'East', dx: 1, dy: 0 },
    { name: 'South', dx: 0, dy: 1 },
    { name: 'West', dx: -1, dy: 0 },
  ];

  for (const dir of directions) {
    if (actions.length >= 4) break;
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    if (nx >= 0 && nx < 12 && ny >= 0 && ny < 12) {
      const tile = level.baseGrid[ny]?.[nx];
      // Check if it's not a wall
      if (tile !== '#') {
        const hasMonster = state.monsters.some((m) => m.alive && m.x === nx && m.y === ny);
        if (!hasMonster) {
          actions.push(`Move ${dir.name}`);
        }
      }
    }
  }

  // 5. Consumables or Utility if space permits
  const hasPotion = state.playerStats.inventory.some((i) => i.toLowerCase().includes('potion'));
  if (actions.length < 4 && hasPotion && state.playerStats.hp < state.playerStats.maxHp) {
    actions.push('Drink Healing Potion');
  }

  if (actions.length < 3) {
    actions.push('Search area carefully');
  }
  if (actions.length < 3) {
    actions.push('Rest and catch breath');
  }

  // Ensure exactly 3 to 4 actions
  return actions.slice(0, 4);
}

export function executePlayerAction(
  currentState: GameState,
  actionText: string
): { newState: GameState; soundType: 'step' | 'attack' | 'monsterHit' | 'chest' | 'trap' | 'door' | 'potion' | null } {
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  if (state.gameOver || state.gameWon) {
    if (actionText.toLowerCase().includes('restart') || actionText.toLowerCase().includes('new delve')) {
      const fresh = createInitialGameState();
      return { newState: fresh, soundType: 'step' };
    }
    return { newState: state, soundType: null };
  }

  state.turnCount += 1;
  const currentLevel = DUNGEON_LEVELS[state.levelIndex];
  const lower = actionText.toLowerCase().trim();
  let soundType: 'step' | 'attack' | 'monsterHit' | 'chest' | 'trap' | 'door' | 'potion' | null = null;
  let combatLog: string | undefined = undefined;

  // 1. ATTACK ACTION
  if (lower.startsWith('attack') || lower.includes('fight') || lower.includes('strike')) {
    const adjMonster = state.monsters.find(
      (m) => m.alive && Math.abs(m.x - state.playerPos.x) + Math.abs(m.y - state.playerPos.y) === 1
    );

    if (adjMonster) {
      soundType = 'attack';
      // Player attacks
      const playerRoll = Math.floor(Math.random() * 4) + state.playerStats.weapon.atkBonus + 2;
      const damageToMonster = Math.max(1, playerRoll - adjMonster.def);
      adjMonster.hp -= damageToMonster;

      combatLog = `You slash ${adjMonster.name} with ${state.playerStats.weapon.name} for ${damageToMonster} damage!`;

      if (adjMonster.hp <= 0) {
        adjMonster.alive = false;
        adjMonster.hp = 0;
        state.playerStats.gold += adjMonster.gold;
        combatLog += ` The ${adjMonster.name} collapses slain! Found ${adjMonster.gold} gold.`;

        // Check if all monsters dead on boss floor
        if (state.levelIndex === DUNGEON_LEVELS.length - 1 && state.monsters.every((m) => !m.alive)) {
          state.gameWon = true;
          combatLog += ' The dungeon lord is vanquished!';
        }
      } else {
        // Monster counter attacks
        const monsterRoll = Math.floor(Math.random() * 3) + adjMonster.atk;
        const damageToPlayer = Math.max(1, monsterRoll - 1);
        state.playerStats.hp = Math.max(0, state.playerStats.hp - damageToPlayer);
        combatLog += ` The ${adjMonster.name} retaliates for ${damageToPlayer} damage!`;

        if (state.playerStats.hp <= 0) {
          state.gameOver = true;
          soundType = 'monsterHit';
        }
      }
    } else {
      combatLog = 'You swing your blade into the empty dark, but no enemy is within reach.';
    }
  }

  // 2. OPEN CHEST
  else if (lower.includes('chest') || lower.includes('loot') || lower === 'open') {
    const chest = state.chests.find(
      (c) => !c.opened && Math.abs(c.x - state.playerPos.x) + Math.abs(c.y - state.playerPos.y) <= 1
    );

    if (chest) {
      chest.opened = true;
      soundType = 'chest';
      state.playerStats.gold += chest.gold;
      let logMsg = `You pry open the chest and find ${chest.gold} gold!`;

      if (chest.weapon && chest.weapon.atk > state.playerStats.weapon.atkBonus) {
        const oldWeapon = state.playerStats.weapon.name;
        state.playerStats.weapon = {
          name: chest.weapon.name,
          atkBonus: chest.weapon.atk,
        };
        logMsg += ` Equipped new weapon: ${chest.weapon.name} (+${chest.weapon.atk} ATK) replacing ${oldWeapon}.`;
      }

      if (chest.item) {
        state.playerStats.inventory.push(chest.item);
        logMsg += ` Placed ${chest.item} into inventory.`;
      }

      combatLog = logMsg;
    } else {
      combatLog = 'There is no unopened chest close enough to reach.';
    }
  }

  // 3. DOOR INTERACTION
  else if (lower.includes('door') || lower.includes('pass through') || lower.includes('portcullis') || lower.includes('gate') || lower.includes('unlock')) {
    const door = state.doors.find(
      (d) => Math.abs(d.x - state.playerPos.x) + Math.abs(d.y - state.playerPos.y) === 1
    );

    if (door) {
      if (door.locked) {
        // Check if player has key
        const keyIndex = state.playerStats.inventory.findIndex(
          (item) => door.keyRequired && item.toLowerCase().includes(door.keyRequired.toLowerCase())
        );

        if (keyIndex !== -1 || state.playerStats.inventory.some((i) => i.toLowerCase().includes('key'))) {
          door.locked = false;
          soundType = 'door';
          combatLog = `You insert the key into the heavy lock. With a resonant scrape of ancient iron, the ${door.name} unlocks!`;
        } else {
          combatLog = `The ${door.name} is sealed tight. You need ${door.keyRequired || 'a key'} to unlock it.`;
        }
      } else {
        // Pass through or move onto door tile
        state.playerPos = { x: door.x, y: door.y };
        soundType = 'door';
        combatLog = `You push through the ${door.name} into the adjoining dungeon passage.`;
      }
    } else {
      combatLog = 'There is no door adjacent to your position.';
    }
  }

  // 4. DRINK POTION
  else if (lower.includes('potion') || lower.includes('drink') || lower.includes('heal')) {
    const potionIndex = state.playerStats.inventory.findIndex((i) =>
      i.toLowerCase().includes('potion')
    );

    if (potionIndex !== -1) {
      const potionName = state.playerStats.inventory[potionIndex];
      state.playerStats.inventory.splice(potionIndex, 1);
      const healAmount = potionName.toLowerCase().includes('greater') ? 16 : 10;
      const prevHp = state.playerStats.hp;
      state.playerStats.hp = Math.min(state.playerStats.maxHp, state.playerStats.hp + healAmount);
      soundType = 'potion';
      combatLog = `You quaff the ${potionName}, soothing your wounds and restoring ${state.playerStats.hp - prevHp} HP.`;
    } else {
      combatLog = 'You do not have any healing potions left in your inventory.';
    }
  }

  // 5. REST / SEARCH
  else if (lower.includes('rest') || lower.includes('catch breath')) {
    if (state.playerStats.hp < state.playerStats.maxHp) {
      state.playerStats.hp = Math.min(state.playerStats.maxHp, state.playerStats.hp + 2);
      combatLog = 'You catch your breath against the stone wall, regaining 2 HP.';
    } else {
      combatLog = 'You steady your resolve and listen to the dungeon echoes. You are already at peak vitality.';
    }
  } else if (lower.includes('search')) {
    // Check if on or adjacent to trap
    const nearTrap = state.traps.find(
      (t) => !t.disarmed && !t.triggered && Math.abs(t.x - state.playerPos.x) <= 1 && Math.abs(t.y - state.playerPos.y) <= 1
    );

    if (nearTrap) {
      nearTrap.disarmed = true;
      combatLog = `Your keen eye detects a ${nearTrap.name}! You carefully wedge a stone under the plate, safely disarming it.`;
    } else {
      combatLog = 'You search the flagstones thoroughly, finding only dust, dried blood, and cold gravel.';
    }
  }

  // 6. MOVEMENT
  else {
    let dx = 0;
    let dy = 0;

    if (lower.includes('north') || lower === 'w' || lower === 'up' || lower === 'n') dy = -1;
    else if (lower.includes('south') || lower === 's' || lower === 'down') dy = 1;
    else if (lower.includes('west') || lower === 'a' || lower === 'left') dx = -1;
    else if (lower.includes('east') || lower === 'd' || lower === 'right' || lower === 'e') dx = 1;

    if (dx !== 0 || dy !== 0) {
      const targetX = state.playerPos.x + dx;
      const targetY = state.playerPos.y + dy;

      if (targetX >= 0 && targetX < 12 && targetY >= 0 && targetY < 12) {
        const tile = currentLevel.baseGrid[targetY]?.[targetX];

        // Check monster blocking
        const monsterAtTile = state.monsters.find(
          (m) => m.alive && m.x === targetX && m.y === targetY
        );

        // Check door blocking
        const doorAtTile = state.doors.find((d) => d.x === targetX && d.y === targetY);

        if (monsterAtTile) {
          // Auto initiate attack!
          return executePlayerAction(currentState, `Attack ${monsterAtTile.name}`);
        } else if (doorAtTile && doorAtTile.locked) {
          combatLog = `The ${doorAtTile.name} is locked! You must unlock it before passing.`;
        } else if (tile === '#') {
          combatLog = 'A solid, moss-covered stone wall blocks your path.';
        } else {
          // Successful step
          state.playerPos = { x: targetX, y: targetY };
          soundType = 'step';

          // Check trap trigger
          const trapAtTile = state.traps.find(
            (t) => !t.disarmed && !t.triggered && t.x === targetX && t.y === targetY
          );
          if (trapAtTile) {
            trapAtTile.triggered = true;
            state.playerStats.hp = Math.max(0, state.playerStats.hp - trapAtTile.damage);
            soundType = 'trap';
            combatLog = `*SNAP!* You step directly onto a ${trapAtTile.name}! Spikes plunge upward, dealing ${trapAtTile.damage} damage!`;

            if (state.playerStats.hp <= 0) {
              state.gameOver = true;
            }
          }

          // Check level exit
          if (
            currentLevel.exitPos &&
            targetX === currentLevel.exitPos.x &&
            targetY === currentLevel.exitPos.y
          ) {
            if (state.levelIndex < DUNGEON_LEVELS.length - 1) {
              state.levelIndex += 1;
              const nextLevel = DUNGEON_LEVELS[state.levelIndex];
              state.playerPos = { ...nextLevel.playerStart };
              state.monsters = JSON.parse(JSON.stringify(nextLevel.monsters));
              state.chests = JSON.parse(JSON.stringify(nextLevel.chests));
              state.traps = JSON.parse(JSON.stringify(nextLevel.traps));
              state.doors = JSON.parse(JSON.stringify(nextLevel.doors));
              combatLog = `You descend the ancient stone stairwell deeper into darkness... Entered ${nextLevel.title}!`;
              soundType = 'door';
            } else {
              state.gameWon = true;
              combatLog = 'You reach the sanctuary exit and escape the dungeon into blazing morning light!';
            }
          }
        }
      } else {
        combatLog = 'You cannot walk outside the boundaries of this dungeon level.';
      }
    } else {
      combatLog = `Command unrecognized: "${actionText}". Please choose an action from the list or move North/South/East/West.`;
    }
  }

  const turn = generateTurn(state, actionText, undefined, combatLog);
  state.turns.push(turn);

  return { newState: state, soundType };
}

export function formatTurnAsMarkdown(turn: GameTurn): string {
  return `### 1. MAP DISPLAY:
\`\`\`
${turn.mapAscii}
\`\`\`

### 2. STATUS BOARD:
- Player HP: [${turn.statusBoard.hp}]
- Gold: [${turn.statusBoard.gold}]
- Weapon: [${turn.statusBoard.weapon}]
- Inventory: [${turn.statusBoard.inventory.length ? turn.statusBoard.inventory.join(', ') : 'Empty'}]

### 3. SCENE DESCRIPTION:
${turn.sceneDescription}

### 4. ACTIONS:
${turn.actions.map((act, i) => `${i + 1}. ${act}`).join('\n')}`;
}
