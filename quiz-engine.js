// quiz-engine.js — pure data + recommendation logic for the player-profile quiz.
// Loaded by index.html and by tests/quiz-logic.test.html. No DOM access here.
(function (root) {
  const TIER_NUM = { Easy: 1, Medium: 2, Hard: 3 };
  const PREF_NUM = { Simple: 1, Medium: 2, Hard: 3, Complex: 4 };
  const EXP_NUM  = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  // Built from the TableTop Games To Go inventory sheet (gid=0). Variant/themed
  // copies collapsed into one entry with a note. playerTypes: S/C/F/So.
  const GAMES = [
    // --- The Architects (S) ---
    { name: "Splendor", playerTypes: ["S"], type: "Competitive", setup: "Medium", mechanics: "Easy", min: 2, max: 4,
      why: "Engine-building and set collection in one 30-minute round — easy to teach, real decisions from turn one.", note: "Also available as a Pokémon edition." },
    { name: "Ticket to Ride Europe", playerTypes: ["S"], type: "Competitive", setup: "Medium", mechanics: "Easy", min: 2, max: 5,
      why: "Route-building strategy across the continent, with steadily rising tension." },
    { name: "Carcassonne", playerTypes: ["S"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 2, max: 5,
      why: "Tile-laying and area control that grows a shared map every turn." },
    { name: "Azul (Mini)", playerTypes: ["S"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 3, max: 4,
      why: "Abstract tile-drafting — simple to grasp, deep to master." },
    { name: "Tokaido", playerTypes: ["S"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 2, max: 5,
      why: "A serene journey of set collection and timing, low on conflict." },
    { name: "Monkey Palace", playerTypes: ["S"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 2, max: 4,
      why: "Tile-building and light engine-building with a family-friendly feel." },
    { name: "Pandemic", playerTypes: ["S"], type: "Cooperative", setup: "Hard", mechanics: "Hard", min: 2, max: 4,
      why: "A tense co-op where the whole group out-thinks a spreading outbreak together." },
    { name: "The Mind", playerTypes: ["S"], type: "Cooperative", setup: "Easy", mechanics: "Easy", min: 2, max: 4,
      why: "A wordless co-op of timing and intuition — deceptively simple, quietly strategic." },
    { name: "Hanabi", playerTypes: ["S"], type: "Cooperative", setup: "Easy", mechanics: "Medium", min: 2, max: 5,
      why: "Cooperative deduction where you see everyone's cards but your own." },

    // --- The Conquerors (C) ---
    { name: "King of Tokyo", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 6,
      why: "Dice-chucking monster battles — simple rules, straight-up aggression." },
    { name: "Munchkin", playerTypes: ["C"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 3, max: 6,
      why: "Backstab through a dungeon-crawl parody where sabotaging a friend is half the fun." },
    { name: "Unmatched", playerTypes: ["C"], type: "Competitive", setup: "Hard", mechanics: "Medium", min: 2, max: 4,
      why: "Head-to-head tactical combat — pick a duo and go to war.", note: "13 sets available (Cobble & Fog, TMNT, Robin Hood vs. Bigfoot, and more)." },
    { name: "Coup + Expansion", playerTypes: ["C"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 2, max: 10,
      why: "Bluff, deduce, and eliminate — a game of nerve and reading the table.", note: "Up to 10 players with the Reformation expansion." },
    { name: "Mascarade", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Medium", min: 2, max: 13,
      why: "Hidden-identity bluffing and memory chaos, best with a big group." },
    { name: "Love Letter", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 4,
      why: "A tiny deduction duel that plays in minutes." },
    { name: "Get Bit", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 6,
      why: "Outswim your friends from a shark — pure, gleeful take-that." },
    { name: "Cover Your Assets", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 6,
      why: "Build a fortune while your friends try to steal it out from under you." },
    { name: "Selfish", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 5,
      why: "A survival scramble where only one of you makes it — sabotage encouraged." },
    { name: "Unstable Unicorns", playerTypes: ["C"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 2, max: 8,
      why: "Build a unicorn army while dismantling everyone else's." },
    { name: "Batam", playerTypes: ["C"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 3, max: 4,
      why: "Bluffing and dice in a cutthroat economic race." },
    { name: "Mille Bornes", playerTypes: ["C"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 6,
      why: "A classic racing card game full of hazards and take-that." },
    { name: "Avalon", playerTypes: ["F", "C"], type: "Competitive", setup: "Medium", mechanics: "Medium", min: 5, max: 10,
      why: "An Arthurian tale of loyalty and betrayal — Merlin, Percival, and the Assassin each play their part." },

    // --- The Dreamweavers (F) ---
    { name: "Dixit", playerTypes: ["F"], type: "Competitive", setup: "Medium", mechanics: "Easy", min: 3, max: 8,
      why: "Dreamlike storytelling with surreal art — no two rounds tell the same story.", note: "Disney Edition also available; up to 8 with expansions." },
    { name: "The Crew: Quest for Planet Nine", playerTypes: ["F"], type: "Cooperative", setup: "Easy", mechanics: "Medium", min: 3, max: 5,
      why: "A cooperative trick-taking campaign through space, mission by mission." },
    { name: "D&D One-Shot with a Company Dungeon Master", playerTypes: ["F"], type: "Cooperative", setup: "Easy", mechanics: "Hard", min: 3, max: 6,
      why: "A full immersive campaign session built around your group — the ultimate Fantasy experience. Our GM handles all the setup." },

    // --- The Connectors (So) ---
    { name: "Spot It!", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 8,
      why: "Quick-reflex pattern matching anyone can join instantly.", note: "Friends, Mario, and Harry Potter decks available." },
    { name: "Flip 7", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 3, max: 18,
      why: "A push-your-luck party card game built for big, loud groups.", note: "'With a Vengeance' variant also available." },
    { name: "Joking Hazard", playerTypes: ["So"], type: "Competitive", setup: "Medium", mechanics: "Easy", min: 3, max: 10,
      why: "Fast, dark comic-building — best for a grown-up crowd ready to laugh at anything." },
    { name: "Sushi Go", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 5,
      why: "Card-drafting cuteness that teaches in a minute." },
    { name: "Exploding Kittens", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 5,
      why: "Push-your-luck card chaos with a mean streak and a laugh." },
    { name: "Cards Against Humanity (Family Edition)", playerTypes: ["So"], type: "Competitive", setup: "Medium", mechanics: "Easy", min: 4, max: 30,
      why: "Fill-in-the-blank party humor, family-friendly and endlessly scalable." },
    { name: "5 Minute Dungeon", playerTypes: ["So"], type: "Cooperative", setup: "Medium", mechanics: "Easy", min: 2, max: 5,
      why: "A frantic real-time co-op dungeon crawl — shout, panic, win together.", note: "Includes the expansion." },
    { name: "Kushi Express", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 4,
      why: "A real-time, dexterity cooking scramble." },
    { name: "Brick Like This", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 8,
      why: "Speed-building party fun anyone can pick up." },
    { name: "Deep Sea Underwater", playerTypes: ["So"], type: "Competitive", setup: "Medium", mechanics: "Easy", min: 2, max: 6,
      why: "A push-your-luck treasure dive — how greedy dare you get?" },
    { name: "Pandemic Contagion", playerTypes: ["So"], type: "Competitive", setup: "Easy", mechanics: "Easy", min: 2, max: 4,
      why: "The competitive flip side of Pandemic — you're the disease this time." }
  ];

  function rangesOverlap(aMin, aMax, bMin, bMax) {
    return aMin <= bMax && bMin <= aMax;
  }

  // Map a 4-level preference to the 1..3 tiers that actually exist in inventory.
  function prefToTierNum(pref) {
    return Math.min(PREF_NUM[pref], 3); // Complex(4) clamps to Hard(3)
  }

  function scoreGame(game, prefs) {
    const matches = { type: false, mechanics: false, setup: false, size: false };
    let score = 0;

    if (prefs.type !== 'either') {
      if (game.type === prefs.type) { score += 2; matches.type = true; }
    }

    const mechDiff = Math.abs(TIER_NUM[game.mechanics] - prefToTierNum(prefs.mechanics));
    if (mechDiff === 0) { score += 2; matches.mechanics = true; }
    else if (mechDiff === 1) { score += 1; }

    const setupDiff = Math.abs(TIER_NUM[game.setup] - prefToTierNum(prefs.setup));
    if (setupDiff === 0) { score += 2; matches.setup = true; }
    else if (setupDiff === 1) { score += 1; }

    if (rangesOverlap(game.min, game.max, prefs.sizeMin, prefs.sizeMax)) {
      score += 2; matches.size = true;
    }

    // Light tie-breaker: does game rules-weight line up with stated experience?
    if (TIER_NUM[game.mechanics] === EXP_NUM[prefs.experience]) score += 1;

    return { score, matches };
  }

  function rankGamesForResult(topAxis, prefs) {
    const pool = GAMES.filter(g => g.playerTypes.includes(topAxis));
    const scored = pool
      .map((game, i) => ({ game, i, ...scoreGame(game, prefs) }))
      .sort((a, b) => b.score - a.score || a.i - b.i); // stable: preserve pool order on ties

    const top = scored.slice(0, 3).map(({ game, score, matches }) => ({ game, score, matches }));
    const restNames = scored.slice(3).map(s => s.game.name);

    const coopUnavailable = prefs.type !== 'either'
      && !pool.some(g => g.type === prefs.type);
    const closestNote = prefs.mechanics === 'Complex' || prefs.setup === 'Complex';

    return { top, restNames, closestNote, coopUnavailable };
  }

  root.QuizEngine = { GAMES, TIER_NUM, PREF_NUM, EXP_NUM, rangesOverlap, scoreGame, rankGamesForResult };
})(typeof window !== 'undefined' ? window : this);
