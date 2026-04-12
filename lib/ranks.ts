export interface UserRank {
  tier: number;
  name: string;
  levels: [number, number];
}

export const USER_RANKS: UserRank[] = [
  { tier: 1, name: 'Smokesniffer', levels: [1, 5] },
  { tier: 2, name: 'Flintfumbler', levels: [6, 10] },
  { tier: 3, name: 'Sootface', levels: [11, 15] },
  { tier: 4, name: 'Emberbeggar', levels: [16, 20] },
  { tier: 5, name: 'Warmseeker', levels: [21, 25] },
  { tier: 6, name: 'Overburner', levels: [26, 30] },
  { tier: 7, name: 'Firestarter', levels: [31, 35] },
  { tier: 8, name: 'Firetender', levels: [36, 40] },
  { tier: 9, name: 'Torchbearer', levels: [41, 45] },
  { tier: 10, name: 'Ashwalker', levels: [46, 50] },
  { tier: 11, name: 'Firebinder', levels: [51, 55] },
  { tier: 12, name: 'Flamecaller', levels: [56, 60] },
  { tier: 13, name: 'Forgemaster', levels: [61, 65] },
  { tier: 14, name: 'Blazewarden', levels: [66, 70] },
  { tier: 15, name: 'Pyromancer', levels: [71, 75] },
  { tier: 16, name: 'Embersage', levels: [76, 80] },
  { tier: 17, name: 'Wildfire', levels: [81, 85] },
  { tier: 18, name: 'Phoenix', levels: [86, 90] },
  { tier: 19, name: 'Everflame', levels: [91, 95] },
  { tier: 20, name: 'Starfire', levels: [96, 100] },
  { tier: 21, name: 'Amaterasu', levels: [101, 105] },
];

export function getUserRank(level = 1): UserRank {
  for (const rank of USER_RANKS) {
    if (level >= rank.levels[0] && level <= rank.levels[1]) {
      return rank;
    }
  }
  // Beyond max tier — return Amaterasu
  return USER_RANKS[USER_RANKS.length - 1];
}
