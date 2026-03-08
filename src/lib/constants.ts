// ─────────────────────────────────────────────────────────────────────────────
// Fictionry Taxonomy v3 — constants
// See fictionry-taxonomy.md for the full specification.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type PrimaryGenre = {
  name: string
  slug: string
  emoji: string
  description: string
  readerDescription: string // shown in reader onboarding
  shortName?: string // abbreviated display name for constrained UI (e.g. compact cards)
}

export type Subgenre = {
  name: string
  slug: string
  description: string
  authorGuidance: string
  shortName?: string // abbreviated display name for constrained UI (e.g. compact cards)
}

export type Tag = {
  name: string
  slug: string
  description: string
}

export type TagGroup = {
  name: string
  slug: string
  countsTowardCap: boolean
  tags: Tag[]
}

export type ContentRating = {
  value: 'everyone' | 'teen' | 'mature' | 'adult_18'
  label: string
  description: string
  examples: string
  gateType: 'none' | 'soft' | 'hard'
  comparable: string
}

export type StoryFormat = {
  value: string
  label: string
  description: string
}

export type OriginType = {
  value: 'original' | 'fan_fiction'
  label: string
  description: string
}

// ── Layer 1: Primary Genres (13) ─────────────────────────────────────────────

export const PRIMARY_GENRES: PrimaryGenre[] = [
  {
    name: 'Fantasy',
    slug: 'fantasy',
    emoji: '🧙',
    description: 'Magic, mythic systems, and impossible worlds as core logic.',
    readerDescription: 'Magic, myths, and otherworldly realms',
  },
  {
    name: 'Science Fiction',
    slug: 'science-fiction',
    emoji: '🚀',
    description: 'Futures, speculative technology, space, and scientifically framed impossibilities.',
    readerDescription: 'Space, technology, and the future',
    shortName: 'Sci-Fi',
  },
  {
    name: 'Horror',
    slug: 'horror',
    emoji: '👻',
    description: 'Primary intent is dread, fear, or unease.',
    readerDescription: 'Terrifying tales and dark dread',
  },
  {
    name: 'Romance',
    slug: 'romance',
    emoji: '💖',
    description: 'The central narrative is a romantic relationship and its development.',
    readerDescription: 'Love stories and heartfelt connections',
  },
  {
    name: 'Thriller & Mystery',
    slug: 'thriller-mystery',
    emoji: '🔍',
    description: 'Suspense, investigation, crime, secrets, pursuit, and revelation.',
    readerDescription: 'Suspense, puzzles, and edge-of-your-seat tension',
    shortName: 'Thriller',
  },
  {
    name: 'Action & Adventure',
    slug: 'action-adventure',
    emoji: '⚔️',
    description: 'Conflict, movement, quests, exploration, or survival as the main engine.',
    readerDescription: 'High-octane thrills, quests, and exploration',
    shortName: 'Action',
  },
  {
    name: 'Comedy & Satire',
    slug: 'comedy-satire',
    emoji: '😂',
    description: 'Primary intent is to amuse, parody, or critique through humour.',
    readerDescription: 'Funny, satirical, and delightfully absurd',
    shortName: 'Comedy',
  },
  {
    name: 'Contemporary Fiction',
    slug: 'contemporary-fiction',
    emoji: '🏙️',
    description: 'Real-world setting, no speculative core premise. Drama, slice-of-life, or commercial.',
    readerDescription: 'Modern-day stories and everyday drama',
    shortName: 'Contemporary',
  },
  {
    name: 'Historical Fiction',
    slug: 'historical-fiction',
    emoji: '📜',
    description: 'Specific real historical period where the setting is a defining feature.',
    readerDescription: 'Stories from ages past',
    shortName: 'Historical',
  },
  {
    name: 'Literary Fiction',
    slug: 'literary-fiction',
    emoji: '📖',
    description: 'Prose craft, theme, and character interiority are primary over plot mechanics.',
    readerDescription: 'Beautifully written, character-driven, idea-rich',
    shortName: 'Literary',
  },
  {
    name: 'Paranormal & Supernatural',
    slug: 'paranormal-supernatural',
    emoji: '🌙',
    description: 'Paranormal/supernatural in a near-real setting — not primarily Horror, Romance, or worldbuilding Fantasy.',
    readerDescription: 'Ghosts, witches, and hidden supernatural worlds',
    shortName: 'Paranormal',
  },
  {
    name: 'Non-Fiction & Essay',
    slug: 'non-fiction-essay',
    emoji: '✍️',
    description: 'True stories, memoir, essay, narrative non-fiction, serial journalism, and craft writing.',
    readerDescription: 'True stories, memoir, and sharp essays',
    shortName: 'Non-Fiction',
  },
  {
    name: 'Fan Fiction',
    slug: 'fan-fiction',
    emoji: '🌟',
    description: 'Stories derived from existing IPs or real public figures.',
    readerDescription: 'Beloved characters, new stories',
  },
]

// Lookup helpers
export const PRIMARY_GENRE_SLUGS = PRIMARY_GENRES.map(g => g.slug)
export const getPrimaryGenreBySlug = (slug: string) =>
  PRIMARY_GENRES.find(g => g.slug === slug)

// ── Layer 2: Subgenres ────────────────────────────────────────────────────────
// Keyed by primary genre slug. Authors see only their genre's subgenres.

export const SUBGENRES: Record<string, Subgenre[]> = {
  'fantasy': [
    { name: 'Epic Fantasy', slug: 'epic-fantasy', description: 'Large-scale world, grand stakes, detailed lore, often multiple POVs.', authorGuidance: 'Tolkien/Sanderson mode' },
    { name: 'LitRPG', slug: 'litrpg', description: 'Explicit game mechanics in the narrative (stats, levels, skills, UI).', authorGuidance: 'If readers see numbers/blue boxes' },
    { name: 'GameLit', slug: 'gamelit', description: 'Game-inspired logic/world without explicit visible system UI.', authorGuidance: 'Game logic, no hard UI emphasis' },
    { name: 'Progression Fantasy', slug: 'progression-fantasy', description: 'Measurable character power growth is the central engine.', authorGuidance: 'Growth arc is the plot engine' },
    { name: 'Cultivation / Xianxia', slug: 'cultivation-xianxia', description: 'Chinese-inspired cultivation systems, spiritual power, martial progression.', authorGuidance: 'Qi, realms, tribulations' },
    { name: 'Wuxia', slug: 'wuxia', description: 'Martial arts-focused, often historical Chinese-inspired, no cultivation required.', authorGuidance: 'Jianghu / martial honour' },
    { name: 'Murim', slug: 'murim', description: 'Korean martial arts fantasy conventions, sects, masters, regressors common.', authorGuidance: 'Korean martial fantasy ecosystem' },
    { name: 'Isekai / Portal Fantasy', slug: 'isekai-portal-fantasy', description: 'Character transported/reincarnated into another world.', authorGuidance: 'Portal/summoned/reborn elsewhere', shortName: 'Isekai' },
    { name: 'Urban Fantasy', slug: 'urban-fantasy', description: 'Magic/supernatural systems in a modern city; worldbuilding focus matters.', authorGuidance: 'Hidden magic society, magical investigation' },
    { name: 'Dark Fantasy / Grimdark', slug: 'dark-fantasy-grimdark', description: 'Bleak, brutal, morally grey fantasy with serious consequences.', authorGuidance: 'Tone-heavy but a stable fantasy convention', shortName: 'Dark Fantasy' },
    { name: 'Mythological Fantasy', slug: 'mythological-fantasy', description: 'Real-world mythologies drive worldbuilding and conflict.', authorGuidance: 'Greek/Norse/Egyptian/etc.-rooted' },
    { name: 'Fairy Tale Retelling', slug: 'fairy-tale-retelling', description: 'Reworking known fairy tales/folk stories.', authorGuidance: 'Retellings/fractures' },
    { name: 'Gaslamp / Steampunk Fantasy', slug: 'gaslamp-steampunk-fantasy', description: 'Industrial-era aesthetics + magic.', authorGuidance: 'Victorian-ish fantasy tech/magic blend', shortName: 'Gaslamp Steampunk' },
    { name: 'Romantasy', slug: 'romantasy', description: 'Fantasy and romance are co-equal narrative engines.', authorGuidance: 'Both must be central' },
    { name: 'Dungeon Core', slug: 'dungeon-core', description: 'MC is the dungeon/intelligence behind the dungeon.', authorGuidance: 'Dungeon consciousness perspective' },
    { name: 'System Apocalypse', slug: 'system-apocalypse', description: 'Real world receives game-like system overlay.', authorGuidance: 'Earth + system arrival' },
    { name: 'Kingdom / Base Building', slug: 'kingdom-base-building', description: 'Governance, settlement growth, expansion are central.', authorGuidance: 'Logistics/infrastructure/politics focus', shortName: 'Kingdom Building' },
    { name: 'Sword & Sorcery', slug: 'sword-and-sorcery', description: 'Personal-scale, episodic, adventure-heavy fantasy.', authorGuidance: 'Conan-style, immediate stakes' },
  ],
  'science-fiction': [
    { name: 'Space Opera', slug: 'space-opera', description: 'Grand-scale interstellar adventure, conflict, civilisation.', authorGuidance: 'Sweeping, large-cast SF' },
    { name: 'Cyberpunk', slug: 'cyberpunk', description: 'High tech, low life, corporate dystopia, neural/city future.', authorGuidance: 'Neon + inequality + tech' },
    { name: 'Post-Apocalyptic', slug: 'post-apocalyptic', description: 'Set after collapse; survival/rebuilding in the aftermath.', authorGuidance: 'Collapse already happened' },
    { name: 'Dystopian', slug: 'dystopian', description: 'Oppressive systems/societies; collapse not required.', authorGuidance: 'Surveillance/control/power' },
    { name: 'Hard Science Fiction', slug: 'hard-science-fiction', description: 'Scientific plausibility and rigor are primary values.', authorGuidance: 'Extrapolation matters' },
    { name: 'Military Science Fiction', slug: 'military-science-fiction', description: 'War and command structures in SF context.', authorGuidance: 'Units/chain of command', shortName: 'Military Sci-Fi' },
    { name: 'Solarpunk', slug: 'solarpunk', description: 'Optimistic, ecological, community-centred future.', authorGuidance: 'Regeneration and hopeful systems' },
    { name: 'Time Travel', slug: 'time-travel', description: 'Temporal mechanics are central to the plot.', authorGuidance: 'Loops/paradoxes/consequences' },
    { name: 'Biopunk / Genepunk', slug: 'biopunk-genepunk', description: 'Genetic engineering, biotech, body-as-platform futures.', authorGuidance: 'Organic/biological tech focus' },
    { name: 'Near-Future Thriller', slug: 'near-future-thriller', description: 'Plausible near-future technology + contemporary stakes.', authorGuidance: "Tomorrow's headlines" },
    { name: 'Mecha', slug: 'mecha', description: 'Giant robots/powered armor as a central SF mode.', authorGuidance: 'SF-first mecha stories' },
    { name: 'First Contact', slug: 'first-contact', description: 'Initial contact with alien intelligence is the story engine.', authorGuidance: 'Communication/collision' },
    { name: 'AI / Singularity', slug: 'ai-singularity', description: 'Machine consciousness, AGI, post-human futures.', authorGuidance: 'Thinking machines at centre' },
    { name: 'Alternate History', slug: 'alternate-history-sf', description: 'Historical divergence leading to a different present/future.', authorGuidance: 'Counterfactual history with speculative framing' },
  ],
  'horror': [
    { name: 'Psychological Horror', slug: 'psychological-horror', description: 'Mental states, paranoia, uncertainty, unreliable reality.', authorGuidance: 'Internal dread', shortName: 'Psych Horror' },
    { name: 'Supernatural Horror', slug: 'supernatural-horror', description: 'Ghosts, demons, monsters, cursed phenomena.', authorGuidance: 'External supernatural threat' },
    { name: 'Cosmic Horror', slug: 'cosmic-horror', description: 'Existential dread, unknowable forces, insignificance.', authorGuidance: 'Lovecraftian scale' },
    { name: 'Body Horror', slug: 'body-horror', description: 'Physical transformation, corruption, visceral biological dread.', authorGuidance: 'Flesh-focused terror' },
    { name: 'Gothic Horror', slug: 'gothic-horror', description: 'Atmosphere, decay, inheritance, haunted spaces.', authorGuidance: 'Gothic architecture + dread' },
    { name: 'Folk Horror', slug: 'folk-horror', description: 'Rural tradition, ritual, landscape/community as threat.', authorGuidance: 'Old ways, harvest dread' },
    { name: 'Slasher / Survival Horror', slug: 'slasher-survival-horror', description: 'Pursuit, entrapment, staying alive under threat.', authorGuidance: 'Chase/survive mode', shortName: 'Slasher/Survival' },
    { name: 'Internet / Analog Horror', slug: 'internet-analog-horror', description: 'Web-native or media-native horror artifacts and storytelling.', authorGuidance: 'Creepypasta/ARG/analog mode', shortName: 'Internet Horror' },
    { name: 'Cozy Horror', slug: 'cozy-horror', description: 'Spooky/uncanny atmosphere without intense terror.', authorGuidance: 'Comfort-spooky' },
    { name: 'Apocalyptic Horror', slug: 'apocalyptic-horror', description: 'End-of-world collapse happening in real time as horror.', authorGuidance: 'Living through the end' },
  ],
  'romance': [
    { name: 'Contemporary Romance', slug: 'contemporary-romance', description: 'Modern, real-world romance.', authorGuidance: 'Present-day romance spine' },
    { name: 'Historical Romance', slug: 'historical-romance', description: 'Period setting, romance central.', authorGuidance: 'Any historical period' },
    { name: 'Regency Romance', slug: 'regency-romance', description: 'Regency/Georgian England conventions.', authorGuidance: 'Ton, titles, social rules' },
    { name: 'Paranormal Romance', slug: 'paranormal-romance', description: 'Supernatural setting/elements, romance spine.', authorGuidance: 'Vampires/shifters/fae + HEA/HFN expectation' },
    { name: 'Romantic Comedy (RomCom)', slug: 'romantic-comedy', description: 'Comedy + romance co-central, light/warm structure.', authorGuidance: 'Banter + HEA' },
    { name: 'Dark Romance', slug: 'dark-romance', description: 'Taboo/dangerous/morally complex romantic dynamics.', authorGuidance: 'Requires careful warnings' },
    { name: 'Mafia / Organised Crime Romance', slug: 'mafia-organised-crime-romance', description: 'Criminal ecosystem is the relationship context.', authorGuidance: 'Mob/mafia underworld romance', shortName: 'Mafia Romance' },
    { name: 'Sports Romance', slug: 'sports-romance', description: 'Sport/athlete life central to romance context.', authorGuidance: 'Team/training/competition matters' },
    { name: 'Workplace Romance', slug: 'workplace-romance', description: 'Professional setting drives relationship proximity and conflict.', authorGuidance: 'Office/hospital/firehouse etc.' },
    { name: 'Boys Love (BL)', slug: 'boys-love', description: 'M/M romance with BL conventions/tradition.', authorGuidance: 'BL-specific reader expectation' },
    { name: 'Girls Love (GL)', slug: 'girls-love', description: 'F/F romance / yuri-adjacent conventions.', authorGuidance: 'GL-specific framing when relevant' },
    { name: 'Omegaverse', slug: 'omegaverse', description: 'A/B/O dynamics as core relationship framework.', authorGuidance: 'Social/biological hierarchy framework' },
    { name: 'Reverse Harem / Why Choose', slug: 'reverse-harem-why-choose', description: 'One lead, multiple love interests, no forced end-choice.', authorGuidance: 'RH/why choose convention', shortName: 'Reverse Harem' },
    { name: 'New Adult Romance', slug: 'new-adult-romance', description: 'Ages ~18–25, first adult-life transitions, romance central.', authorGuidance: 'Between YA and adult market positioning' },
  ],
  'thriller-mystery': [
    { name: 'Cozy Mystery', slug: 'cozy-mystery', description: 'Amateur sleuth, low graphic violence, community puzzle.', authorGuidance: 'Cozy puzzle-first mystery' },
    { name: 'Crime Thriller', slug: 'crime-thriller', description: 'Investigation/procedural/criminal pursuit.', authorGuidance: 'Professional or high-stakes crime focus' },
    { name: 'Psychological Thriller', slug: 'psychological-thriller', description: 'Tension from manipulation, perception, distrust.', authorGuidance: 'Mind-games and instability', shortName: 'Psych Thriller' },
    { name: 'Espionage / Spy Thriller', slug: 'espionage-spy-thriller', description: 'Intelligence, covert operations, geopolitical stakes.', authorGuidance: 'Agencies/secrets/tradecraft', shortName: 'Spy Thriller' },
    { name: 'Legal / Court Drama', slug: 'legal-court-drama', description: 'Justice/procedure/courts central to tension.', authorGuidance: 'Trial/case-driven structure' },
    { name: 'Conspiracy Thriller', slug: 'conspiracy-thriller', description: 'Hidden powers, institutions, dangerous truths.', authorGuidance: 'Cover-up/exposure structure' },
    { name: 'Political Thriller', slug: 'political-thriller', description: 'Power, government, geopolitics, political machinery.', authorGuidance: 'State/policy/power stakes' },
    { name: 'Heist', slug: 'heist', description: 'Planning + execution of theft/con/operation.', authorGuidance: 'Plan and payoff are central' },
    { name: 'Noir', slug: 'noir', description: 'Fatalism, cynicism, moral ambiguity, urban grime.', authorGuidance: 'Noir sensibility/conventions' },
    { name: 'Whodunit', slug: 'whodunit', description: 'Fair-play clue mystery, solvable puzzle emphasis.', authorGuidance: 'Classic detective puzzle mode' },
  ],
  'action-adventure': [
    { name: 'Dungeon Crawl', slug: 'dungeon-crawl', description: 'Exploration of dangerous dungeons, traps, loot, survival.', authorGuidance: 'Adventurers enter the dungeon' },
    { name: 'Survival', slug: 'survival', description: 'Endurance against hostile environments/disasters/situations.', authorGuidance: 'Survival is the engine' },
    { name: 'Superhero', slug: 'superhero', description: 'Superpowered conflict/adventure in modern/near-future settings.', authorGuidance: 'Capes/teams/vigilantes' },
    { name: 'Martial Arts', slug: 'martial-arts', description: 'Combat craft, training, competition, philosophy (non-cultivation focus).', authorGuidance: 'Real-world/light-speculative martial focus' },
    { name: 'Military / War', slug: 'military-war', description: 'Combat, tactics, campaign action, cost of war.', authorGuidance: 'Action/war-first framing' },
    { name: 'Pirate / Seafaring', slug: 'pirate-seafaring', description: 'Ships, ocean travel, naval conflict, maritime adventure.', authorGuidance: 'Seafaring adventure identity' },
    { name: 'Treasure Hunting / Exploration', slug: 'treasure-hunting-exploration', description: 'Expedition, discovery, ruins, archaeology-style adventure.', authorGuidance: 'Discovery-driven action', shortName: 'Treasure Hunting' },
    { name: 'Tower Climbing', slug: 'tower-climbing', description: 'Vertical challenge progression floor-by-floor.', authorGuidance: 'Tower ascent as core structure' },
  ],
  'comedy-satire': [
    { name: 'Comedic Fantasy', slug: 'comedic-fantasy', description: 'Fantasy setting where comedy is the core reading promise.', authorGuidance: 'Funny-first fantasy' },
    { name: 'Parody', slug: 'parody', description: 'Exaggerates genre conventions for comic effect.', authorGuidance: 'Direct imitation/mockery' },
    { name: 'Absurdist Fiction', slug: 'absurdist-fiction', description: 'Surreal logic, nonsense structures, meaning through absurdity.', authorGuidance: 'Reality misbehaves' },
    { name: 'Romantic Comedy', slug: 'romantic-comedy-satire', description: 'Romance and comedy co-drive the story.', authorGuidance: 'Romcom-first audience promise', shortName: 'Romantic Comedy' },
    { name: 'Workplace Comedy', slug: 'workplace-comedy', description: 'Workplace/social systems are the engine of humour.', authorGuidance: 'Job is the joke' },
    { name: 'Social Satire', slug: 'social-satire', description: 'Uses humour to critique institutions/culture.', authorGuidance: 'Society-targeted comedy' },
    { name: 'Dark Comedy', slug: 'dark-comedy', description: 'Humour around bleak/taboo/disturbing subject matter.', authorGuidance: 'Gallows humour mode' },
  ],
  'contemporary-fiction': [
    { name: 'Slice of Life', slug: 'slice-of-life', description: 'Everyday moments and lived texture over dramatic plot.', authorGuidance: 'Life-as-lived focus' },
    { name: 'Coming of Age', slug: 'coming-of-age', description: 'Identity formation and growth through formative experiences.', authorGuidance: 'Youth/transition arcs' },
    { name: 'Family Drama', slug: 'family-drama', description: 'Family relationships and tensions are central.', authorGuidance: 'Generational dynamics' },
    { name: 'Workplace Fiction', slug: 'workplace-fiction', description: 'Career/professional life and identity at the centre.', authorGuidance: 'Work as social world' },
    { name: 'Sports Fiction', slug: 'sports-fiction', description: 'Competition/training/team identity in real-world setting.', authorGuidance: 'Sport-world first' },
    { name: 'Campus / Academic Fiction', slug: 'campus-academic-fiction', description: 'School/university/academic institution defines culture and conflict.', authorGuidance: 'Campus systems matter', shortName: 'Campus Fiction' },
    { name: 'Foodie Fiction', slug: 'foodie-fiction', description: 'Food/cooking/hospitality culture drives setting and story.', authorGuidance: 'Culinary-centred fiction' },
    { name: 'Music Fiction', slug: 'music-fiction', description: 'Music creation/performance/industry central to story.', authorGuidance: 'Band/artist/scene focus' },
  ],
  'historical-fiction': [
    { name: 'Ancient World', slug: 'ancient-world', description: 'Pre-medieval real historical settings.', authorGuidance: 'Egypt/Rome/Han/etc.' },
    { name: 'Medieval', slug: 'medieval', description: 'Medieval-era historical settings (non-magical).', authorGuidance: 'Approx. 500–1400 CE' },
    { name: 'Renaissance & Early Modern', slug: 'renaissance-early-modern', description: '15th–17th century historical settings.', authorGuidance: '1400–1700 CE', shortName: 'Renaissance' },
    { name: 'Victorian & Edwardian', slug: 'victorian-edwardian', description: 'Industrial/class/empire era historical settings.', authorGuidance: '1800–1914' },
    { name: '20th Century', slug: '20th-century', description: 'WWI through late Cold War historical fiction.', authorGuidance: '1914–1990' },
    { name: 'Non-Western Historical', slug: 'non-western-historical', description: 'Historical fiction centred on non-European settings/perspectives.', authorGuidance: 'Any period, non-Western focus', shortName: 'Non-Western' },
    { name: 'Alternate History', slug: 'alternate-history', description: 'Counterfactual historical divergence in a historical-fiction frame.', authorGuidance: '"What if" history' },
    { name: 'War Fiction (Historical)', slug: 'war-fiction-historical', description: 'Historical conflict from soldier/civilian/community perspectives.', authorGuidance: 'War shapes the story', shortName: 'War Fiction' },
  ],
  'literary-fiction': [
    { name: 'Magical Realism', slug: 'magical-realism', description: 'Mundane world with subtle magical elements treated as normal.', authorGuidance: 'Literary realism + quiet magic' },
    { name: 'Satirical Fiction', slug: 'satirical-fiction', description: 'Narrative fiction used for social/political critique.', authorGuidance: 'Literary satire focus' },
    { name: 'Philosophical Fiction', slug: 'philosophical-fiction', description: 'Questions/ideas/ethics are primary content.', authorGuidance: 'Idea-driven literary fiction', shortName: 'Philosophical' },
    { name: 'Absurdist Literary Fiction', slug: 'absurdist-literary-fiction', description: 'Literary absurdism, alienation, surreal systems.', authorGuidance: 'Kafka-adjacent traditions', shortName: 'Absurdist' },
    { name: 'Political Fiction', slug: 'political-fiction', description: 'Power, ideology, governance as literary focus.', authorGuidance: 'Political systems as theme' },
    { name: 'Autofiction', slug: 'autofiction', description: 'Fictionalised autobiography/author-self blending.', authorGuidance: 'Memoir-fiction blur' },
    { name: 'Speculative Literary Fiction', slug: 'speculative-literary-fiction', description: 'Literary fiction with speculative elements, literary frame primary.', authorGuidance: 'Literary-first speculative', shortName: 'Spec. Literary' },
  ],
  'paranormal-supernatural': [
    { name: 'Ghost Story', slug: 'ghost-story', description: 'Hauntings/spirits/liminal spaces in a near-real setting.', authorGuidance: 'If dread dominates, choose Horror' },
    { name: 'Witches & Covens', slug: 'witches-covens', description: 'Witchcraft, covens, magical community in near-real settings.', authorGuidance: 'Paranormal community focus' },
    { name: 'Angels & Demons', slug: 'angels-demons', description: 'Divine/infernal beings in contemporary or near-real settings.', authorGuidance: 'Modern sacred/infernal conflict' },
    { name: 'Psychic / Abilities', slug: 'psychic-abilities', description: 'Paranormal mental/perceptual abilities in real-world contexts.', authorGuidance: 'Psychic powers, no system framing' },
    { name: 'Shifter Fiction', slug: 'shifter-fiction', description: 'Shapeshifter identity and community central (non-romance-primary).', authorGuidance: 'Pack/shifter culture focus' },
    { name: 'Urban Supernatural', slug: 'urban-supernatural', description: 'Hidden supernatural societies in real cities (less system-heavy than urban fantasy).', authorGuidance: 'Secret supernatural underworld' },
    { name: 'Occult / Cursed Objects', slug: 'occult-cursed-objects', description: 'Rituals, curses, occult phenomena, haunted artifacts.', authorGuidance: 'Paranormal object/event-driven stories', shortName: 'Occult' },
  ],
  'non-fiction-essay': [
    { name: 'Personal Memoir', slug: 'personal-memoir', description: 'First-person true-life narrative.', authorGuidance: 'Your lived experience' },
    { name: 'Narrative Non-Fiction', slug: 'narrative-non-fiction', description: 'True events told with narrative/literary technique.', authorGuidance: 'Story-structured truth', shortName: 'Narrative NF' },
    { name: 'Personal Essay / Column', slug: 'personal-essay-column', description: 'Serialised reflection/opinion/personal perspective.', authorGuidance: 'Essayistic format', shortName: 'Personal Essay' },
    { name: 'Travel Writing', slug: 'travel-writing', description: 'Place/culture/movement as subject.', authorGuidance: 'Place and meaning' },
    { name: 'Creative Non-Fiction', slug: 'creative-non-fiction', description: 'Factually grounded but literary/crafted in form.', authorGuidance: 'Artful truth-telling' },
    { name: 'Craft & How-To', slug: 'craft-how-to', description: 'Writing/process/skill guidance for readers/creators.', authorGuidance: 'Practical instruction' },
    { name: 'Investigative / Deep Dive', slug: 'investigative-deep-dive', description: 'Research-driven serial or longform inquiry.', authorGuidance: 'Evidence/explainer reporting', shortName: 'Investigative' },
  ],
  'fan-fiction': [
    { name: 'Canon Compliant', slug: 'canon-compliant', description: 'Consistent with canon and set within canon logic.', authorGuidance: 'Gap fills / canon-consistent extensions' },
    { name: 'Canon Divergent', slug: 'canon-divergent', description: 'Follows canon until a branching point.', authorGuidance: '"What if X happened instead?"' },
    { name: 'Alternate Universe (AU)', slug: 'alternate-universe', description: 'Characters/premise recontextualised in a different setting.', authorGuidance: 'Coffee shop AU, school AU, etc.' },
    { name: 'Fix-It', slug: 'fix-it', description: 'Rewrites canon outcomes to repair perceived failures.', authorGuidance: 'Saves characters / fixes endings' },
    { name: 'Crossover', slug: 'crossover', description: 'Multiple canons/properties intersect.', authorGuidance: 'Shared canon collision' },
    { name: 'Reader Insert / Self-Insert', slug: 'reader-insert-self-insert', description: 'Reader stand-in or self enters canon world.', authorGuidance: 'Y/N or self-insert convention', shortName: 'Reader Insert' },
    { name: 'OC-Centric', slug: 'oc-centric', description: 'Original character is the focal lead in canon world.', authorGuidance: 'New protagonist in known universe' },
    { name: 'Continuation / Sequel', slug: 'continuation-sequel', description: 'Continues events after canon ends.', authorGuidance: '"What happened next?"' },
    { name: 'Prequel', slug: 'prequel', description: 'Set before canon.', authorGuidance: 'Backstory/origin events' },
    { name: 'Retelling', slug: 'retelling', description: 'Canon story retold from another lens.', authorGuidance: 'Alternate POV/angle' },
    { name: 'Real Person Fiction (RPF)', slug: 'real-person-fiction', description: 'Fiction about real public figures.', authorGuidance: 'Must display prominent RPF warning' },
    { name: 'Fusion', slug: 'fusion', description: "One canon's structure/world overlaid with another's characters/elements.", authorGuidance: 'Canon A in Canon B framework' },
  ],
}

export const getSubgenresForGenre = (genreSlug: string): Subgenre[] =>
  SUBGENRES[genreSlug] ?? []

// ── Layer 3: Tags (8 groups) ──────────────────────────────────────────────────

export const TAG_GROUPS: TagGroup[] = [
  {
    name: 'Tone & Mood',
    slug: 'tone-mood',
    countsTowardCap: false, // unlimited
    tags: [
      { name: 'Dark & Gritty', slug: 'dark-gritty', description: 'Bleak world, hard choices, moral ambiguity' },
      { name: 'Cozy & Warm', slug: 'cozy-warm', description: 'Comfort reading, low threat, soft feelings' },
      { name: 'Bittersweet', slug: 'bittersweet', description: 'Joy and sorrow intertwined' },
      { name: 'Hopeful', slug: 'hopeful', description: 'Things may be bad, but there is forward light' },
      { name: 'Bleak', slug: 'bleak', description: 'Unrelenting darkness, tragic/nihilistic tone' },
      { name: 'Humorous', slug: 'humorous', description: 'Funny throughout, not just occasional jokes' },
      { name: 'Satirical', slug: 'satirical', description: 'Humour used to critique real systems/culture' },
      { name: 'Philosophical', slug: 'philosophical', description: 'Ideas/questions matter as much as events' },
      { name: 'Tense & Suspenseful', slug: 'tense-suspenseful', description: 'Constant anticipation/unease' },
      { name: 'Slow & Immersive', slug: 'slow-immersive', description: 'Atmospheric, deliberate pacing' },
      { name: 'Fast-Paced', slug: 'fast-paced', description: 'High plot velocity' },
      { name: 'Melancholic', slug: 'melancholic', description: 'Wistful sadness/loss' },
      { name: 'Uplifting', slug: 'uplifting', description: 'Emotionally restorative or encouraging' },
      { name: 'Whimsical', slug: 'whimsical', description: 'Playful, imaginative, lightly surreal' },
      { name: 'Nostalgic', slug: 'nostalgic', description: 'Memory/looking-back emotional texture' },
      { name: 'Intense', slug: 'intense', description: 'Emotionally or physically extreme feel' },
      { name: 'Eerie', slug: 'eerie', description: 'Unsettling atmosphere without full horror commitment' },
    ],
  },
  {
    name: 'Romantic & Relationship Elements',
    slug: 'romantic-relationship',
    countsTowardCap: true,
    tags: [
      { name: 'Slow Burn', slug: 'slow-burn', description: 'Romance develops gradually over many chapters' },
      { name: 'Enemies to Lovers', slug: 'enemies-to-lovers', description: 'Adversaries become romantic partners' },
      { name: 'Friends to Lovers', slug: 'friends-to-lovers', description: 'Friendship becomes romance' },
      { name: 'Forbidden Love', slug: 'forbidden-love', description: 'Relationship crosses social/political/moral boundary' },
      { name: 'Second Chance', slug: 'second-chance', description: 'Former lovers reconnect' },
      { name: 'Love Triangle', slug: 'love-triangle', description: 'Three-way romantic tension' },
      { name: 'Unrequited Love', slug: 'unrequited-love', description: 'One-sided romantic feeling' },
      { name: 'Found Family', slug: 'found-family', description: 'Chosen familial bonds form between non-blood characters' },
      { name: 'Polyamory', slug: 'polyamory', description: 'Multiple consensual romantic relationships' },
      { name: 'Age Gap', slug: 'age-gap', description: 'Significant age difference between romantic leads' },
      { name: 'Forced Proximity', slug: 'forced-proximity', description: 'Characters must remain near each other' },
      { name: 'Fated Mates', slug: 'fated-mates', description: 'Destined/supernatural bond' },
      { name: 'Harem', slug: 'harem', description: 'One lead, multiple romantic/sexual interests (anime/manga convention)' },
      { name: 'Possessive / Jealous Lead', slug: 'possessive-jealous-lead', description: 'Possessiveness is a featured dynamic' },
      { name: 'Marriage of Convenience', slug: 'marriage-of-convenience', description: 'Practical arrangement develops real feelings' },
      { name: 'Slow-Build Relationship', slug: 'slow-build-relationship', description: 'Deep non-romantic relationship develops slowly' },
    ],
  },
  {
    name: 'Character & POV',
    slug: 'character-pov',
    countsTowardCap: true,
    tags: [
      { name: 'Female Lead', slug: 'female-lead', description: 'Primary protagonist is female' },
      { name: 'Male Lead', slug: 'male-lead', description: 'Primary protagonist is male' },
      { name: 'Non-Binary Lead', slug: 'non-binary-lead', description: 'Primary protagonist is non-binary/genderqueer' },
      { name: 'Non-Human Lead', slug: 'non-human-lead', description: 'Protagonist is monster/AI/dungeon/animal/etc.' },
      { name: 'Multiple POV', slug: 'multiple-pov', description: 'More than one key perspective character' },
      { name: 'Single POV', slug: 'single-pov', description: 'One exclusive perspective' },
      { name: 'First Person', slug: 'first-person', description: '"I" narration' },
      { name: 'Second Person', slug: 'second-person', description: '"You" narration' },
      { name: 'Unreliable Narrator', slug: 'unreliable-narrator', description: 'Narrator cannot be fully trusted' },
      { name: 'Anti-Hero', slug: 'anti-hero', description: 'Morally grey or flawed protagonist' },
      { name: 'Villain Protagonist', slug: 'villain-protagonist', description: 'Lead is antagonist or morally dark focal' },
      { name: 'Child / Teen POV', slug: 'child-teen-pov', description: 'Young perspective character(s)' },
      { name: 'Ensemble Cast', slug: 'ensemble-cast', description: 'Large group of co-important characters' },
      { name: 'Morally Grey Characters', slug: 'morally-grey-characters', description: 'No clean heroes/villains' },
      { name: 'Competent Lead', slug: 'competent-lead', description: 'Skilled/capable protagonist from early on' },
      { name: 'Reluctant Hero', slug: 'reluctant-hero', description: 'Protagonist resists the role/calling' },
    ],
  },
  {
    name: 'Plot & Structure',
    slug: 'plot-structure',
    countsTowardCap: true,
    tags: [
      { name: 'Nonlinear', slug: 'nonlinear', description: 'Fragmented chronology, timeline jumps' },
      { name: 'Slow Start', slug: 'slow-start', description: 'Takes time before main conflict ignites' },
      { name: 'Action from Page One', slug: 'action-from-page-one', description: 'Immediate high-energy opening' },
      { name: 'Plot Twists', slug: 'plot-twists', description: 'Surprise reveals materially change understanding' },
      { name: 'Mystery Box', slug: 'mystery-box', description: 'Central long-arc mystery unfolds gradually' },
      { name: 'Character Study', slug: 'character-study', description: 'Psychology/interiority is primary focus' },
      { name: 'Plot-Heavy', slug: 'plot-heavy', description: 'Event progression prioritized over introspection' },
      { name: 'Dual Timeline', slug: 'dual-timeline', description: 'Two time periods run in parallel' },
      { name: 'Cliffhangers', slug: 'cliffhangers', description: 'Chapters frequently end unresolved' },
      { name: 'Framing Device', slug: 'framing-device', description: 'Story-within-story / mediated narration' },
      { name: 'Standalone', slug: 'standalone', description: 'Complete narrative, no sequel required' },
      { name: 'Anthology', slug: 'anthology', description: 'Multiple standalone pieces in shared frame' },
      { name: 'Political Intrigue', slug: 'political-intrigue', description: 'Factions/court/power manoeuvring central' },
      { name: 'Heist / Caper', slug: 'heist-caper', description: 'Planning + execution structure central' },
    ],
  },
  {
    name: 'World & Setting',
    slug: 'world-setting',
    countsTowardCap: true,
    tags: [
      { name: 'Original World', slug: 'original-world', description: 'Entirely invented setting' },
      { name: 'Real-World Setting', slug: 'real-world-setting', description: 'Set in the real world (modern or historical)' },
      { name: 'School / Campus', slug: 'school-campus', description: 'Education setting is primary' },
      { name: 'Small Town', slug: 'small-town', description: 'Rural/small-community setting' },
      { name: 'Big City', slug: 'big-city', description: 'Urban/metropolitan setting' },
      { name: 'Space Setting', slug: 'space-setting', description: 'Space stations/ships/alien worlds' },
      { name: 'Historical Setting', slug: 'historical-setting', description: 'Specific historical era as setting feature' },
      { name: 'Non-Western Setting', slug: 'non-western-setting', description: 'Non-European/North American setting focus' },
      { name: 'Mythology-Based', slug: 'mythology-based', description: 'Uses real mythological traditions as core source' },
      { name: 'Virtual World / Game World', slug: 'virtual-game-world', description: 'Simulation/game/VR setting' },
      { name: 'Underwater / Ocean', slug: 'underwater-ocean', description: 'Aquatic or maritime world focus' },
      { name: 'Underground / Subterranean', slug: 'underground-subterranean', description: 'Caves/deep earth/underground cities' },
      { name: 'Multi-World / Dimensional', slug: 'multi-world-dimensional', description: 'Multiple worlds/planes/dimensions' },
      { name: 'Post-Apocalyptic World', slug: 'post-apocalyptic-world', description: 'Set after civilisation collapse' },
      { name: 'Prison / Captivity Setting', slug: 'prison-captivity-setting', description: 'Constrained/controlled setting' },
    ],
  },
  {
    name: 'Power & Progression',
    slug: 'power-progression',
    countsTowardCap: true,
    tags: [
      { name: 'Power Fantasy', slug: 'power-fantasy', description: 'Empowerment wish-fulfilment is core appeal' },
      { name: 'Underdog', slug: 'underdog', description: 'Disadvantaged/underestimated protagonist' },
      { name: 'Overpowered Lead', slug: 'overpowered-lead', description: 'Extremely powerful protagonist early on' },
      { name: 'Weak to Strong', slug: 'weak-to-strong', description: 'Clear growth from weak to formidable' },
      { name: 'Slow Progression', slug: 'slow-progression', description: 'Growth is gradual and earned' },
      { name: 'Smart Lead', slug: 'smart-lead', description: 'Intelligence/planning is primary weapon' },
      { name: 'Tactical / Strategy', slug: 'tactical-strategy', description: 'Conflict resolved through planning/strategy' },
      { name: 'Magic System (Hard)', slug: 'magic-system-hard', description: 'Rules-based, explicit magic logic' },
      { name: 'Magic System (Soft)', slug: 'magic-system-soft', description: 'Mystical/impressionistic magic logic' },
      { name: 'RPG Elements', slug: 'rpg-elements', description: 'Game-like mechanics/classes/levels exist' },
      { name: 'System / Status Screen', slug: 'system-status-screen', description: 'Visible UI/stat menus/status overlays' },
      { name: 'Crafting / Building', slug: 'crafting-building', description: 'Making/building is a recurring engine' },
      { name: 'Monster Evolution', slug: 'monster-evolution', description: 'Evolution stages/tiers are central' },
      { name: 'Regression', slug: 'regression', description: 'Return to an earlier time with memory/knowledge' },
      { name: 'Skill Trees / Abilities', slug: 'skill-trees-abilities', description: 'Structured ability unlock paths' },
    ],
  },
  {
    name: 'Tropes & Story Patterns',
    slug: 'tropes-story-patterns',
    countsTowardCap: true,
    tags: [
      { name: 'Chosen One', slug: 'chosen-one', description: 'Prophesied/selected/destined protagonist' },
      { name: 'Reincarnation', slug: 'reincarnation', description: 'Character dies and is reborn' },
      { name: 'Time Loop', slug: 'time-loop', description: 'Repeating temporal period' },
      { name: 'Revenge Plot', slug: 'revenge-plot', description: 'Vengeance drives the story' },
      { name: 'Redemption Arc', slug: 'redemption-arc', description: 'Moral recovery of flawed/villainous character' },
      { name: 'Mentor / Apprentice', slug: 'mentor-apprentice', description: 'Teacher-student dynamic central' },
      { name: 'Tournament Arc', slug: 'tournament-arc', description: 'Structured competition framework' },
      { name: 'Hidden Identity', slug: 'hidden-identity', description: 'Concealed true identity/status' },
      { name: 'Secret Society', slug: 'secret-society', description: 'Hidden organisation exerts power' },
      { name: 'Academy / School Arc', slug: 'academy-school-arc', description: 'Training/school arc structure' },
      { name: 'Transmigration', slug: 'transmigration', description: 'Consciousness moves to another body/world' },
      { name: 'Awakening / Unlock', slug: 'awakening-unlock', description: 'Hidden power/truth is discovered' },
      { name: 'Survival Games', slug: 'survival-games', description: 'Forced deadly competition' },
      { name: 'Dungeon Diving', slug: 'dungeon-diving', description: 'Repeated dungeon/instance exploration for growth/loot' },
      { name: 'Kingdom Building', slug: 'kingdom-building', description: 'Building/governing a domain is a recurring plot engine' },
      { name: 'Monster Taming', slug: 'monster-taming', description: 'Capture/raise/bond with creatures' },
      { name: 'Apocalypse Prevention', slug: 'apocalypse-prevention', description: 'Trying to stop impending catastrophe' },
    ],
  },
  {
    name: 'Representation',
    slug: 'representation',
    countsTowardCap: false, // unlimited
    tags: [
      { name: 'LGBTQ+ Leads', slug: 'lgbtq-leads', description: 'One or more primary characters are LGBTQ+' },
      { name: 'LGBTQ+ Themes', slug: 'lgbtq-themes', description: 'Queerness is a thematic element' },
      { name: 'POC Leads', slug: 'poc-leads', description: 'One or more primary characters are people of colour' },
      { name: 'Disability Rep', slug: 'disability-rep', description: 'Meaningful disability representation' },
      { name: 'Neurodivergent Leads', slug: 'neurodivergent-leads', description: 'ADHD/autism/dyslexia/etc. representation' },
      { name: 'Religious Themes', slug: 'religious-themes', description: 'Faith/spirituality is explored' },
      { name: 'Cultural Specificity', slug: 'cultural-specificity', description: 'Rooted in specific cultural tradition/context' },
      { name: 'Mental Health Focus', slug: 'mental-health-focus', description: 'Mental health explored with depth/care' },
      { name: 'Chronic Illness Rep', slug: 'chronic-illness-rep', description: 'Characters living with chronic illness' },
      { name: 'Indigenous Perspectives', slug: 'indigenous-perspectives', description: 'Indigenous peoples/knowledge/worldviews centred' },
      { name: 'Trans Protagonist', slug: 'trans-protagonist', description: 'Explicit trans main character' },
      { name: 'Multilingual', slug: 'multilingual', description: 'Multiple languages used meaningfully' },
    ],
  },
]

export const TAG_CAP = 12 // max tags that count toward the cap

// Flat list of all tags for search/validation
export const ALL_TAGS = TAG_GROUPS.flatMap(g => g.tags)

export const getTagGroupForTag = (tagSlug: string): TagGroup | undefined =>
  TAG_GROUPS.find(g => g.tags.some(t => t.slug === tagSlug))

export const tagCountsTowardCap = (tagSlug: string): boolean =>
  getTagGroupForTag(tagSlug)?.countsTowardCap ?? true

// ── Layer 4: Content Ratings ──────────────────────────────────────────────────

export const CONTENT_RATINGS: ContentRating[] = [
  {
    value: 'everyone',
    label: 'Everyone',
    description: 'Suitable for all ages. No graphic violence or sexual content. Only mild fear or themes.',
    examples: 'Children\'s stories, gentle fantasy, wholesome slice-of-life',
    gateType: 'none',
    comparable: 'G / U',
  },
  {
    value: 'teen',
    label: 'Teen',
    description: 'Mild violence, age-appropriate romance, non-graphic scary themes, some strong language.',
    examples: 'YA fantasy, school drama, light adventure with stakes',
    gateType: 'none',
    comparable: 'PG-13 / 12',
  },
  {
    value: 'mature',
    label: 'Mature',
    description: 'Strong language, violence, non-explicit sexual content, dark or complex themes.',
    examples: 'Grimdark fantasy, crime thriller, dark romance (non-explicit)',
    gateType: 'soft',
    comparable: 'MA15+ / 15',
  },
  {
    value: 'adult_18',
    label: 'Adult 18+',
    description: 'Explicit sexual content, extreme violence, or content requiring adult verification.',
    examples: 'Explicit romance, extreme horror, graphic violence',
    gateType: 'hard',
    comparable: 'R18+',
  },
]

// ── Layer 5: Formats ──────────────────────────────────────────────────────────

export const STORY_FORMATS: StoryFormat[] = [
  { value: 'serial_novel', label: 'Serial Novel', description: 'Ongoing chapter-based story — the classic web fiction format' },
  { value: 'complete_novel', label: 'Complete Novel', description: 'Finished long-form work with all chapters available' },
  { value: 'novella', label: 'Novella', description: 'Complete work approximately 20,000–50,000 words' },
  { value: 'short_story', label: 'Short Story', description: 'Complete work under approximately 20,000 words' },
  { value: 'short_story_collection', label: 'Short Story Collection', description: 'Multiple short stories in one collection' },
  { value: 'flash_fiction_collection', label: 'Flash Fiction Collection', description: 'Very short pieces, often under 1,000 words each' },
  { value: 'verse_poetry', label: 'Verse / Poetry', description: 'Story primarily in verse or poetic form' },
  { value: 'interactive_cyoa', label: 'Interactive / CYOA', description: 'Reader choices affect the path through the story' },
  { value: 'anthology', label: 'Anthology', description: 'Multi-author works with shared theme or world' },
  { value: 'essay_column', label: 'Essay / Column', description: 'Serial or standalone non-fiction essays' },
  { value: 'webcomic_illustrated', label: 'Webcomic / Illustrated Serial', description: 'Primarily visual storytelling with panels or illustrations' },
]

// ── Meta dimensions ───────────────────────────────────────────────────────────

export const ORIGIN_TYPES: OriginType[] = [
  {
    value: 'original',
    label: 'Original Fiction',
    description: 'Your own original story, characters, and world',
  },
  {
    value: 'fan_fiction',
    label: 'Fan Fiction',
    description: 'Based on an existing IP, franchise, or real public figures',
  },
]

// ── Compatibility shims (used by browse/sitemap — will be removed in PR 2) ───

/** @deprecated Use PRIMARY_GENRES instead */
export const GENRES = PRIMARY_GENRES.map(g => g.slug)

// ── Community Picks (unchanged) ───────────────────────────────────────────────

export const COMMUNITY_PICK_MIN_XP = 250
export const COMMUNITY_PICK_MAX_VOTES_PER_MONTH = 3
export const COMMUNITY_PICK_MIN_WORDS = 10000
