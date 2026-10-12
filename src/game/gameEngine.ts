import {
  FloorData,
  GameTurn,
  Monster,
  GroundItem,
  Door,
  PlayerStats,
} from '../types/game';
import { createFloor1, generateProceduralFloor } from './dungeonGenerator';

export interface GameState {
  floorData: FloorData;
  playerPos: { x: number; y: number };
  playerStats: PlayerStats;
  monsters: Monster[];
  items: GroundItem[];
  doors: Door[];
  turns: GameTurn[];
  turnCount: number;
  gameOver: boolean;
  gameWon: boolean;
}

export function createInitialGameState(): GameState {
  const floor1 = createFloor1();
  const playerStats: PlayerStats = {
    hp: 30,
    maxHp: 30,
    mp: 15,
    maxMp: 15,
    level: 1,
    exp: 0,
    maxExp: 30,
    weapon: {
      name: 'Rusted Iron Blade',
      damage: 3,
    },
    armor: {
      name: 'Tattered Cloth Tunic',
      defense: 1,
    },
    gold: 0,
    keys: 0,
    potions: 1,
    keyItems: ['Adventurer Crest'],
  };

  const state: GameState = {
    floorData: floor1,
    playerPos: { ...floor1.playerStart },
    playerStats,
    monsters: JSON.parse(JSON.stringify(floor1.monsters)),
    items: JSON.parse(JSON.stringify(floor1.items)),
    doors: JSON.parse(JSON.stringify(floor1.doors)),
    turns: [],
    turnCount: 1,
    gameOver: false,
    gameWon: false,
  };

  const initialTurn = generateTurn(state, undefined, floor1.themeDescription);
  state.turns = [initialTurn];

  return state;
}

export function render20x20Map(
  floorData: FloorData,
  playerPos: { x: number; y: number },
  monsters: Monster[],
  items: GroundItem[],
  doors: Door[]
): string {
  // 20x20 grid copy
  const grid: string[][] = Array.from({ length: 20 }, (_, y) => {
    const row = floorData.baseGrid[y] || '####################';
    return row.split('');
  });

  // Render stairs down '>'
  const { stairsPos } = floorData;
  if (stairsPos && stairsPos.y >= 0 && stairsPos.y < 20 && stairsPos.x >= 0 && stairsPos.x < 20) {
    grid[stairsPos.y][stairsPos.x] = '>';
  }

  // Render doors ('+' closed or '/' open)
  doors.forEach((door) => {
    if (door.y >= 0 && door.y < 20 && door.x >= 0 && door.x < 20) {
      grid[door.y][door.x] = door.isOpen ? '/' : '+';
    }
  });

  // Render ground items ('$', 'P', 'K', 'W', 'A', '?')
  items.forEach((item) => {
    if (item.y >= 0 && item.y < 20 && item.x >= 0 && item.x < 20) {
      grid[item.y][item.x] = item.type;
    }
  });

  // Render living monsters ('g', 'S', 'O', 'D')
  monsters.forEach((monster) => {
    if (monster.alive && monster.y >= 0 && monster.y < 20 && monster.x >= 0 && monster.x < 20) {
      grid[monster.y][monster.x] = monster.symbol;
    }
  });

  // Render player '@'
  if (playerPos.y >= 0 && playerPos.y < 20 && playerPos.x >= 0 && playerPos.x < 20) {
    grid[playerPos.y][playerPos.x] = '@';
  }

  return grid.map((row) => row.join('')).join('\n');
}

export function generateTurn(
  state: GameState,
  actionTaken?: string,
  customSceneAndLog?: string
): GameTurn {
  const mapAscii = render20x20Map(
    state.floorData,
    state.playerPos,
    state.monsters,
    state.items,
    state.doors
  );

  const { playerStats } = state;
  const statusBoard = {
    location: `Floor ${state.floorData.floorNumber}`,
    stats: `HP: [${playerStats.hp}/${playerStats.maxHp}] | MP: [${playerStats.mp}/${playerStats.maxMp}] | Level: [${playerStats.level}] (EXP: [${playerStats.exp}/${playerStats.maxExp}])`,
    gear: `Weapon: [${playerStats.weapon.name} (+${playerStats.weapon.damage})] | Armor: [${playerStats.armor.name} (+${playerStats.armor.defense})]`,
    bag: `Gold: [${playerStats.gold}] | Keys: [${playerStats.keys}] | Potions: [${playerStats.potions}] | Key Items: [${playerStats.keyItems.length > 0 ? playerStats.keyItems.join(', ') : 'None'}]`,
    raw: {
      ...playerStats,
      keyItems: [...playerStats.keyItems],
    },
  };

  const sceneAndCombatLog =
    customSceneAndLog || buildSceneAndCombatLog(state);

  const availableActions = determineAvailableActions(state);

  return {
    turnNumber: state.turnCount,
    floor: state.floorData.floorNumber,
    mapAscii,
    statusBoard,
    sceneAndCombatLog,
    availableActions,
    actionTaken,
    timestamp: Date.now(),
  };
}

function buildSceneAndCombatLog(state: GameState): string {
  if (state.gameOver) {
    return 'Your breath falters as the dungeon darkness closes in. Your body collapses onto the cold stones, becoming another grim warning for future delvers.';
  }

  if (state.gameWon) {
    return 'The monstrous dragon collapses with a final earth-shaking shudder! Golden light pours down the vaulted hall as you claim the legendary dungeon crown and step forth as conqueror!';
  }

  const { x, y } = state.playerPos;

  // Check adjacent monsters
  const adjMonster = state.monsters.find(
    (m) => m.alive && Math.abs(m.x - x) + Math.abs(m.y - y) === 1
  );
  if (adjMonster) {
    return `A menacing ${adjMonster.name} (${adjMonster.symbol}) snarls within striking distance! Its weapons glint under your torchlight as it poises to strike.`;
  }

  // Check adjacent or standing items
  const itemHere = state.items.find((i) => i.x === x && i.y === y);
  if (itemHere) {
    return `You step beside a ${itemHere.name} (${itemHere.type}). ${itemHere.description}`;
  }

  // Check adjacent door
  const adjDoor = state.doors.find(
    (d) => Math.abs(d.x - x) + Math.abs(d.y - y) === 1
  );
  if (adjDoor) {
    return `You stand before ${adjDoor.name} [${adjDoor.isOpen ? 'Open /' : 'Closed +' }]. Cool drafts and distant echoes murmur through the stone seam.`;
  }

  // Check stairs
  if (state.floorData.stairsPos && state.floorData.stairsPos.x === x && state.floorData.stairsPos.y === y) {
    return 'You stand directly atop the ancient stone staircase (>) spiraling into the deep abyss below. The deeper dungeon awaits your descent.';
  }

  const atmos = [
    'Distant water droplets echo through the cavernous 20x20 corridor. The smell of cold slate and ancient ashes hangs heavy in the still air.',
    'Cobwebs tremble as a faint draft stirs along the mossy flagstones. Shadows dance across the walls with every flicker of your torch.',
    'Quiet settles over the stone hall, broken only by your measured footsteps. The ancient masonry holds countless secrets yet to be uncovered.',
  ];

  return atmos[(state.turnCount + x + y) % atmos.length];
}

function determineAvailableActions(state: GameState): string[] {
  if (state.gameOver) {
    return [
      'Restart Adventure on Floor 1',
      'Inspect Cause of Death',
      'Begin New Character Run',
      'Review Chronicle Log',
    ];
  }

  if (state.gameWon) {
    return [
      'Descend into Endless Delve Mode',
      'Celebrate Victorious Conquest',
      'Return to Surface Tavern',
      'Begin New Game Plus',
    ];
  }

  const actions: string[] = [];
  const { x, y } = state.playerPos;

  // 1. Monster attack if adjacent
  const adjMonster = state.monsters.find(
    (m) => m.alive && Math.abs(m.x - x) + Math.abs(m.y - y) === 1
  );
  if (adjMonster) {
    actions.push(`Attack ${adjMonster.name} (${adjMonster.symbol}) with ${state.playerStats.weapon.name}`);
    if (state.playerStats.mp >= 4) {
      actions.push(`Cast Arcane Bolt at ${adjMonster.name} (4 MP)`);
    }
  }

  // 2. Stairs Down if on stairs
  const onStairs =
    state.floorData.stairsPos &&
    state.floorData.stairsPos.x === x &&
    state.floorData.stairsPos.y === y;
  if (onStairs) {
    actions.push(`Descend Stairs (>) to Floor ${state.floorData.floorNumber + 1}`);
  }

  // 3. Door interaction if adjacent
  const adjDoor = state.doors.find(
    (d) => Math.abs(d.x - x) + Math.abs(d.y - y) === 1
  );
  if (adjDoor) {
    if (!adjDoor.isOpen) {
      if (adjDoor.requiresKey) {
        actions.push(`Unlock ${adjDoor.name} with Key (${state.playerStats.keys} Keys)`);
      } else {
        actions.push(`Open ${adjDoor.name} (+)`);
      }
    }
  }

  // 4. Item pickup or inspection if on tile
  const itemHere = state.items.find((i) => i.x === x && i.y === y);
  if (itemHere) {
    actions.push(`Pick up ${itemHere.name} (${itemHere.type})`);
  }

  // 5. Cardinal Movements
  const dirs = [
    { name: 'North', dx: 0, dy: -1 },
    { name: 'East', dx: 1, dy: 0 },
    { name: 'South', dx: 0, dy: 1 },
    { name: 'West', dx: -1, dy: 0 },
  ];

  for (const d of dirs) {
    if (actions.length >= 5) break;
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (nx >= 0 && nx < 20 && ny >= 0 && ny < 20) {
      const tile = state.floorData.baseGrid[ny]?.[nx];
      if (tile !== '#') {
        const hasMonster = state.monsters.some((m) => m.alive && m.x === nx && m.y === ny);
        const closedDoor = state.doors.some((door) => !door.isOpen && door.x === nx && door.y === ny);
        if (!hasMonster && !closedDoor) {
          actions.push(`Move ${d.name}`);
        }
      }
    }
  }

  // 6. Usables (Potion or Rest)
  if (actions.length < 5 && state.playerStats.potions > 0 && (state.playerStats.hp < state.playerStats.maxHp || state.playerStats.mp < state.playerStats.maxMp)) {
    actions.push(`Use Health/Mana Potion (${state.playerStats.potions} in Bag)`);
  }

  if (actions.length < 4) {
    actions.push('Rest and catch breath');
  }
  if (actions.length < 4) {
    actions.push('Inspect surroundings for hidden traps');
  }

  return actions.slice(0, 5);
}

export function executeTurnAction(
  currentState: GameState,
  actionText: string
): { newState: GameState; soundType: 'step' | 'attack' | 'monsterHit' | 'chest' | 'trap' | 'door' | 'potion' | null } {
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const lower = actionText.toLowerCase().trim();
  let soundType: 'step' | 'attack' | 'monsterHit' | 'chest' | 'trap' | 'door' | 'potion' | null = null;
  let logMessage = '';

  if (state.gameOver || state.gameWon) {
    if (lower.includes('restart') || lower.includes('begin new') || lower.includes('new game') || lower.includes('delve')) {
      const fresh = createInitialGameState();
      return { newState: fresh, soundType: 'step' };
    }
    return { newState: state, soundType: null };
  }

  state.turnCount += 1;
  const { x, y } = state.playerPos;

  // 1. ARCANE BOLT / SPELL ATTACK
  if (lower.includes('arcane bolt') || lower.includes('spell') || lower.includes('magic')) {
    const adjMonster = state.monsters.find(
      (m) => m.alive && Math.abs(m.x - x) + Math.abs(m.y - y) <= 2
    );
    if (adjMonster && state.playerStats.mp >= 4) {
      state.playerStats.mp -= 4;
      const spellDmg = Math.floor(Math.random() * 6) + 12;
      adjMonster.hp -= spellDmg;
      soundType = 'attack';
      logMessage = `You unleash an Arcane Bolt crackling into ${adjMonster.name} for ${spellDmg} arcane damage!`;

      if (adjMonster.hp <= 0) {
        adjMonster.alive = false;
        adjMonster.hp = 0;
        state.playerStats.gold += adjMonster.gold;
        gainExp(state, adjMonster.exp);
        logMessage += ` The ${adjMonster.name} disintegrates in a shower of sparks! Plundered ${adjMonster.gold} Gold and gained ${adjMonster.exp} EXP.`;
        if (adjMonster.type === 'D') {
          state.gameWon = true;
          logMessage += ' The Boss Dragon has fallen! The labyrinth is yours!';
        }
      }
    } else if (state.playerStats.mp < 4) {
      logMessage = 'Not enough Mana (MP) to cast Arcane Bolt!';
    } else {
      logMessage = 'No monster in range for your spell.';
    }
  }

  // 2. MELEE ATTACK
  else if (lower.startsWith('attack') || lower.includes('strike') || lower.includes('slash')) {
    const adjMonster = state.monsters.find(
      (m) => m.alive && Math.abs(m.x - x) + Math.abs(m.y - y) === 1
    );

    if (adjMonster) {
      soundType = 'attack';
      const playerRoll =
        Math.floor(Math.random() * 4) +
        state.playerStats.weapon.damage +
        state.playerStats.level * 2;
      const dmg = Math.max(1, playerRoll - adjMonster.def);
      adjMonster.hp -= dmg;

      logMessage = `You strike ${adjMonster.name} with ${state.playerStats.weapon.name} for ${dmg} damage!`;

      if (adjMonster.hp <= 0) {
        adjMonster.alive = false;
        adjMonster.hp = 0;
        state.playerStats.gold += adjMonster.gold;
        gainExp(state, adjMonster.exp);
        logMessage += ` The ${adjMonster.name} is slain! Found ${adjMonster.gold} Gold and earned ${adjMonster.exp} EXP.`;

        if (adjMonster.type === 'D') {
          state.gameWon = true;
          logMessage += ' The legendary Boss Dragon collapses slain! You have conquered the dungeon depths!';
        }
      } else {
        // Monster retaliates
        const monsterRoll = Math.floor(Math.random() * 3) + adjMonster.atk;
        const damageTaken = Math.max(1, monsterRoll - state.playerStats.armor.defense);
        state.playerStats.hp = Math.max(0, state.playerStats.hp - damageTaken);
        logMessage += ` The ${adjMonster.name} retaliates for ${damageTaken} damage!`;

        if (state.playerStats.hp <= 0) {
          state.gameOver = true;
          soundType = 'monsterHit';
        }
      }
    } else {
      logMessage = 'You swing your blade into empty air, but no monster is adjacent.';
    }
  }

  // 3. DESCEND STAIRS (>)
  else if (lower.includes('descend') || lower.includes('stairs') || lower === '>') {
    const onStairs =
      state.floorData.stairsPos &&
      state.floorData.stairsPos.x === x &&
      state.floorData.stairsPos.y === y;

    if (onStairs) {
      const nextFloorNum = state.floorData.floorNumber + 1;
      const nextFloorData = generateProceduralFloor(nextFloorNum);
      state.floorData = nextFloorData;
      state.playerPos = { ...nextFloorData.playerStart };
      state.monsters = JSON.parse(JSON.stringify(nextFloorData.monsters));
      state.items = JSON.parse(JSON.stringify(nextFloorData.items));
      state.doors = JSON.parse(JSON.stringify(nextFloorData.doors));
      soundType = 'door';
      logMessage = `You venture down the spiraling stone stairs deeper into the earth... Entered ${nextFloorData.name}!`;
    } else {
      logMessage = 'You must stand directly on the Stairs Down (>) to descend.';
    }
  }

  // 4. UNLOCK OR OPEN DOOR (+ -> /)
  else if (lower.includes('door') || lower.includes('unlock') || lower.includes('portcullis')) {
    const adjDoor = state.doors.find(
      (d) => Math.abs(d.x - x) + Math.abs(d.y - y) === 1
    );

    if (adjDoor) {
      if (adjDoor.isOpen) {
        logMessage = `The ${adjDoor.name} is already open. You can freely walk through.`;
      } else if (adjDoor.requiresKey) {
        if (state.playerStats.keys > 0) {
          state.playerStats.keys -= 1;
          adjDoor.isOpen = true;
          adjDoor.requiresKey = false;
          soundType = 'door';
          logMessage = `You turn the heavy key in the tumbler. The ${adjDoor.name} unlocks and swings open (/)!`;
        } else {
          logMessage = `The ${adjDoor.name} is locked tight (+). You need a Door Key (K) to open it.`;
        }
      } else {
        adjDoor.isOpen = true;
        soundType = 'door';
        logMessage = `You push open the heavy ${adjDoor.name} (/)!`;
      }
    } else {
      logMessage = 'No door is close enough to interact with.';
    }
  }

  // 5. PICK UP OR USE ITEM ON TILE
  else if (lower.includes('pick up') || lower.includes('loot') || lower.includes('grab')) {
    const itemIndex = state.items.findIndex((i) => i.x === x && i.y === y);
    if (itemIndex !== -1) {
      const item = state.items[itemIndex];
      state.items.splice(itemIndex, 1);
      soundType = 'chest';

      if (item.type === '$') {
        const goldAmt = item.value || 30;
        state.playerStats.gold += goldAmt;
        logMessage = `You scooped up the ${item.name}, adding ${goldAmt} Gold to your pouch!`;
      } else if (item.type === 'K') {
        state.playerStats.keys += 1;
        state.playerStats.keyItems.push(item.name);
        logMessage = `You acquired the ${item.name}! Added 1 Key to your bag.`;
      } else if (item.type === 'P') {
        state.playerStats.potions += 1;
        logMessage = `You picked up a ${item.name}! Potions count increased to ${state.playerStats.potions}.`;
      } else if (item.type === 'W' && item.weaponData) {
        const oldWep = state.playerStats.weapon.name;
        state.playerStats.weapon = item.weaponData;
        logMessage = `You equipped ${item.weaponData.name} (+${item.weaponData.damage} Damage), replacing ${oldWep}!`;
      } else if (item.type === 'A' && item.armorData) {
        const oldArm = state.playerStats.armor.name;
        state.playerStats.armor = item.armorData;
        logMessage = `You donned the ${item.armorData.name} (+${item.armorData.defense} Defense), replacing ${oldArm}!`;
      } else if (item.type === '?') {
        state.playerStats.hp = state.playerStats.maxHp;
        state.playerStats.mp = state.playerStats.maxMp;
        gainExp(state, 25);
        soundType = 'potion';
        logMessage = `You pray before the ${item.name}! Warm radiant starlight washes over you, completely restoring HP and MP, and granting +25 EXP!`;
      }
    } else {
      logMessage = 'There is no item on this tile to pick up.';
    }
  }

  // 6. USE POTION
  else if (lower.includes('potion') || lower.includes('drink potion')) {
    if (state.playerStats.potions > 0) {
      state.playerStats.potions -= 1;
      const hpHealed = 20;
      const mpHealed = 10;
      state.playerStats.hp = Math.min(state.playerStats.maxHp, state.playerStats.hp + hpHealed);
      state.playerStats.mp = Math.min(state.playerStats.maxMp, state.playerStats.mp + mpHealed);
      soundType = 'potion';
      logMessage = `You drank a Potion! Restored +${hpHealed} HP and +${mpHealed} MP. Remaining potions: ${state.playerStats.potions}.`;
    } else {
      logMessage = 'You do not have any potions remaining in your bag.';
    }
  }

  // 7. REST / INSPECT
  else if (lower.includes('rest')) {
    const hpRegen = 2;
    const mpRegen = 2;
    state.playerStats.hp = Math.min(state.playerStats.maxHp, state.playerStats.hp + hpRegen);
    state.playerStats.mp = Math.min(state.playerStats.maxMp, state.playerStats.mp + mpRegen);
    logMessage = `You pause to rest, regaining ${hpRegen} HP and ${mpRegen} MP.`;
  } else if (lower.includes('inspect')) {
    logMessage = 'You inspect the walls and floorstones; no hidden spike triggers or secret passages are detected in this sector.';
  }

  // 8. CARDINAL MOVEMENT (North, South, East, West)
  else {
    let dx = 0;
    let dy = 0;

    if (lower.includes('north') || lower === 'w' || lower === 'up' || lower === 'n') dy = -1;
    else if (lower.includes('south') || lower === 's' || lower === 'down') dy = 1;
    else if (lower.includes('west') || lower === 'a' || lower === 'left') dx = -1;
    else if (lower.includes('east') || lower === 'd' || lower === 'right' || lower === 'e') dx = 1;

    if (dx !== 0 || dy !== 0) {
      const targetX = x + dx;
      const targetY = y + dy;

      if (targetX >= 0 && targetX < 20 && targetY >= 0 && targetY < 20) {
        const tile = state.floorData.baseGrid[targetY]?.[targetX];
        const monsterAtTile = state.monsters.find(
          (m) => m.alive && m.x === targetX && m.y === targetY
        );
        const doorAtTile = state.doors.find((d) => d.x === targetX && d.y === targetY);

        if (monsterAtTile) {
          // Bumping monster initiates attack
          return executeTurnAction(currentState, `Attack ${monsterAtTile.name}`);
        } else if (doorAtTile && !doorAtTile.isOpen) {
          if (doorAtTile.requiresKey) {
            if (state.playerStats.keys > 0) {
              doorAtTile.isOpen = true;
              state.playerStats.keys -= 1;
              state.playerPos = { x: targetX, y: targetY };
              soundType = 'door';
              logMessage = `You unlocked the ${doorAtTile.name} with your key and stepped through (/)!`;
            } else {
              logMessage = `The ${doorAtTile.name} is locked (+). You need a key (K) to open it.`;
            }
          } else {
            doorAtTile.isOpen = true;
            state.playerPos = { x: targetX, y: targetY };
            soundType = 'door';
            logMessage = `You pushed open the ${doorAtTile.name} and walked into the next room (/)!`;
          }
        } else if (tile === '#') {
          logMessage = 'A solid stone wall blocks your path.';
        } else {
          // Valid move
          state.playerPos = { x: targetX, y: targetY };
          soundType = 'step';
          logMessage = `You moved ${getDirName(dx, dy)} to (${targetX}, ${targetY}).`;

          // Check if stepped into lava hazard '~'
          if (tile === '~') {
            const lavaDmg = 5;
            state.playerStats.hp = Math.max(0, state.playerStats.hp - lavaDmg);
            soundType = 'trap';
            logMessage += ` Scorching lava (~) burns your boots for ${lavaDmg} damage!`;
            if (state.playerStats.hp <= 0) {
              state.gameOver = true;
            }
          }

          // Auto-pickup gold, key, or potion if stepped on tile
          const groundItem = state.items.find((i) => i.x === targetX && i.y === targetY);
          if (groundItem) {
            if (groundItem.type === '$' || groundItem.type === 'K' || groundItem.type === 'P') {
              const itemIdx = state.items.findIndex((i) => i.id === groundItem.id);
              if (itemIdx !== -1) {
                state.items.splice(itemIdx, 1);
                soundType = 'chest';
                if (groundItem.type === '$') {
                  const gVal = groundItem.value || 30;
                  state.playerStats.gold += gVal;
                  logMessage += ` Picked up ${groundItem.name} (+${gVal} Gold)!`;
                } else if (groundItem.type === 'K') {
                  state.playerStats.keys += 1;
                  logMessage += ` Grabbed ${groundItem.name} (+1 Key)!`;
                } else if (groundItem.type === 'P') {
                  state.playerStats.potions += 1;
                  logMessage += ` Picked up ${groundItem.name} (+1 Potion)!`;
                }
              }
            } else {
              logMessage += ` You see ${groundItem.name} (${groundItem.type}) on the floor.`;
            }
          }

          // Check stairs
          if (
            state.floorData.stairsPos &&
            state.floorData.stairsPos.x === targetX &&
            state.floorData.stairsPos.y === targetY
          ) {
            logMessage += ' You have reached the Stairs Down (>). Choose "Descend Stairs" to delve deeper!';
          }
        }
      } else {
        logMessage = 'Cannot move outside the bounds of the 20x20 dungeon.';
      }
    } else {
      logMessage = `Command "${actionText}" not recognized. Choose from the available actions or move North/South/East/West.`;
    }
  }

  const turn = generateTurn(state, actionText, logMessage);
  state.turns.push(turn);

  return { newState: state, soundType };
}

function gainExp(state: GameState, amount: number) {
  state.playerStats.exp += amount;
  while (state.playerStats.exp >= state.playerStats.maxExp) {
    state.playerStats.exp -= state.playerStats.maxExp;
    state.playerStats.level += 1;
    state.playerStats.maxHp += 8;
    state.playerStats.hp = state.playerStats.maxHp;
    state.playerStats.maxMp += 5;
    state.playerStats.mp = state.playerStats.maxMp;
    state.playerStats.maxExp = Math.floor(state.playerStats.maxExp * 1.5);
  }
}

function getDirName(dx: number, dy: number): string {
  if (dy === -1) return 'North';
  if (dy === 1) return 'South';
  if (dx === -1) return 'West';
  if (dx === 1) return 'East';
  return '';
}

// Exactly formatted string as required by the prompt
export function formatTurnOutput(turn: GameTurn): string {
  return `### 1. MAP DISPLAY:
\`\`\`
${turn.mapAscii}
\`\`\`

### 2. STATUS & INVENTORY BOARD:
- Location: [${turn.statusBoard.location}]
- Stats: ${turn.statusBoard.stats}
- Gear: ${turn.statusBoard.gear}
- Bag: ${turn.statusBoard.bag}

### 3. SCENE & COMBAT LOG:
${turn.sceneAndCombatLog}

### 4. AVAILABLE ACTIONS:
${turn.availableActions.map((act, i) => `${i + 1}. ${act}`).join('\n')}`;
}
