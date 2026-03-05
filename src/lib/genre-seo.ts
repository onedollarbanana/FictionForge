interface GenreSeoData {
  description: string
  longDescription: string
  relatedGenres: string[]
  icon: string
  metaTitle: string
  metaDescription: string
}

const FALLBACK_SEO: GenreSeoData = {
  description: 'Discover stories on Fictionry.',
  longDescription: 'Discover stories on Fictionry.',
  relatedGenres: [],
  icon: '📚',
  metaTitle: 'Stories | Fictionry',
  metaDescription: 'Discover stories on Fictionry.',
}

// Helper: get SEO data for a genre by slug (never returns null — callers can rely on this)
export function getGenreSeo(slug: string): GenreSeoData {
  return GENRE_SEO[slug] ?? FALLBACK_SEO
}

// Slug IS the canonical key in v3 — these helpers are provided for
// backward-compat with existing page code (will be cleaned up in PR 2)
export function genreToSlug(genre: string): string {
  return genre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function slugToGenre(slug: string): string {
  return decodeURIComponent(slug)
}

// Keyed by primary genre slug (matches PRIMARY_GENRES in constants.ts)
export const GENRE_SEO: Record<string, GenreSeoData> = {
  'fantasy': {
    description: 'Magic, mythic systems, and worlds where the impossible is everyday.',
    longDescription: `Fantasy is the most-read genre on web fiction platforms worldwide — and for good reason. From sprawling epic worlds with intricate magic systems to cosy portal adventures and grimdark moral labyrinths, Fantasy offers a reading experience that nothing else can replicate.

On Fictionry, Fantasy is home to LitRPG, progression fantasy, cultivation, isekai, dungeon core, romantasy, and everything in between. Authors build worlds chapter by chapter, and readers follow along as those worlds grow.

Whether you want blue boxes and stat screens, slow-burn epic lore, or a cosy slice-of-life with magic in the background, you'll find it here — updated regularly by writers who love the genre as much as you do.`,
    relatedGenres: ['science-fiction', 'action-adventure', 'paranormal-supernatural', 'horror'],
    icon: '🧙',
    metaTitle: 'Fantasy Web Fiction & Stories | Fictionry',
    metaDescription: 'Read the best fantasy web fiction on Fictionry. LitRPG, progression fantasy, isekai, epic fantasy, and more — updated regularly by talented authors.',
  },
  'science-fiction': {
    description: 'Futures, speculative technology, space, and the science of impossible things.',
    longDescription: `Science fiction asks the most important question in fiction: what if? What if humanity reached the stars? What if machines became conscious? What if one decision in 1942 changed everything?

Fictionry's Science Fiction library spans hard SF grounded in real physics, space opera brimming with interstellar politics, cyberpunk neon-lit dystopias, and solarpunk visions of a better tomorrow. These are stories that dare to imagine.

Web fiction is one of the best formats for SF — authors can build out their universes chapter by chapter, exploring ideas that a single novel couldn't contain. Follow your favourite authors as their futures unfold.`,
    relatedGenres: ['fantasy', 'thriller-mystery', 'action-adventure', 'literary-fiction'],
    icon: '🚀',
    metaTitle: 'Science Fiction Web Stories | Fictionry',
    metaDescription: 'Discover science fiction web fiction on Fictionry. Space opera, cyberpunk, hard SF, dystopian futures, and more — serialised stories updated regularly.',
  },
  'horror': {
    description: 'Dread, fear, and the things that live in the dark.',
    longDescription: `Horror readers know something other genre readers don't: the best fear isn't a jump scare. It's the slow creep of wrongness, the thing glimpsed at the edge of vision, the truth you wished you hadn't uncovered.

Fictionry's Horror library covers the full spectrum — psychological dread, supernatural haunts, cosmic horror where the universe is indifferent and vast, folk horror rooted in old traditions, and internet horror native to the digital age. Our authors understand pacing, and the serialised chapter format is made for building dread.

If you've ever read something that made you check over your shoulder, you'll find more of it here.`,
    relatedGenres: ['thriller-mystery', 'paranormal-supernatural', 'literary-fiction', 'fantasy'],
    icon: '👻',
    metaTitle: 'Horror Web Fiction & Stories | Fictionry',
    metaDescription: 'Read horror web fiction on Fictionry. Psychological dread, supernatural horror, cosmic horror, folk horror, and more from authors who know how to scare.',
  },
  'romance': {
    description: 'Love stories in every form — the spark, the tension, the resolution.',
    longDescription: `Romance is one of the most-read fiction categories on the planet, and web fiction has made it even more accessible. Serialised romance means you can follow a relationship chapter by chapter, living inside every tension-filled moment.

Fictionry's Romance library spans contemporary and historical, paranormal and dark, slow burn and whirlwind. From BL with all its genre conventions to steamy dark romance with careful content warnings, from regency-era courtship to modern workplace tension — there's something here for every romance reader.

HEA and HFN are honoured here. Our readers are enthusiastic, our authors are dedicated, and the stories keep coming.`,
    relatedGenres: ['contemporary-fiction', 'paranormal-supernatural', 'fantasy', 'historical-fiction'],
    icon: '💖',
    metaTitle: 'Romance Web Fiction & Stories | Fictionry',
    metaDescription: 'Read romance web fiction on Fictionry. Slow burn, dark romance, paranormal romance, BL, historical romance, and more — updated chapter by chapter.',
  },
  'thriller-mystery': {
    description: 'Suspense, secrets, investigation, and the satisfaction of revelation.',
    longDescription: `A great thriller or mystery does something other genres rarely manage: it makes you feel like you're racing against the story itself. You want to figure it out before the reveal. You want to catch the liar. You want to know what's inside the box.

Fictionry's Thriller & Mystery library is one of the most underserved categories on web fiction platforms — and we think that's an opportunity. Cozy mysteries with amateur sleuths, high-stakes espionage, procedural crime, psychological thrillers where reality can't quite be trusted, noir fatalism, locked-room whodunits.

Serialised chapters are perfect for this genre. Cliffhangers were practically invented for mystery.`,
    relatedGenres: ['horror', 'contemporary-fiction', 'science-fiction', 'historical-fiction'],
    icon: '🔍',
    metaTitle: 'Thriller & Mystery Web Fiction | Fictionry',
    metaDescription: 'Read thriller and mystery web fiction on Fictionry. Crime thrillers, cozy mysteries, psychological suspense, espionage, noir, and more.',
  },
  'action-adventure': {
    description: 'Quests, combat, exploration, and stories that never stop moving.',
    longDescription: `Action & Adventure is pure forward momentum. These are stories where the plot doesn't pause — where every chapter raises the stakes, advances the quest, or lands the heroes somewhere new and dangerous.

On Fictionry you'll find dungeon crawls with tactical depth, survival stories in extreme environments, superhero tales with ensemble casts, martial arts epics of personal discipline, seafaring adventures across unknown oceans, and tower-climbing progressions where each floor brings a harder challenge.

If you want a story that grabs you by the collar and doesn't let go, this is your genre.`,
    relatedGenres: ['fantasy', 'science-fiction', 'thriller-mystery', 'comedy-satire'],
    icon: '⚔️',
    metaTitle: 'Action & Adventure Web Fiction | Fictionry',
    metaDescription: 'Read action and adventure web fiction on Fictionry. Dungeon crawls, survival, superhero, martial arts, tower climbing, and more.',
  },
  'comedy-satire': {
    description: 'Stories that make you laugh — and sometimes make you think.',
    longDescription: `Comedy is a serious reading identity. Comedy & Satire readers aren't here for the occasional funny moment — they're here because humour is the point. Because absurdism is a lens, parody is an art form, and a perfectly timed joke can land harder than any dramatic reveal.

Fictionry's Comedy & Satire library includes comedic fantasy where the joke is the world, social satire with teeth, dark comedy that finds humour in the bleakest places, romantic comedy with all its beloved banter, and pure absurdism where reality has given up trying to make sense.

Funny fiction is hard to write. The authors here are good at it.`,
    relatedGenres: ['contemporary-fiction', 'fantasy', 'science-fiction', 'action-adventure'],
    icon: '😂',
    metaTitle: 'Comedy & Satire Web Fiction | Fictionry',
    metaDescription: 'Read comedy and satire web fiction on Fictionry. Comedic fantasy, social satire, parody, dark comedy, absurdist fiction, and more.',
  },
  'contemporary-fiction': {
    description: 'The real world, rendered in fiction. Drama, slice-of-life, and everyday lives.',
    longDescription: `Contemporary Fiction is the genre of the recognisable. No magic, no spaceships — just people, places, and the texture of modern life. Which doesn't mean simple: contemporary fiction contains some of the most emotionally complex and character-driven stories on the platform.

You'll find coming-of-age stories that capture exactly what it felt like to be that age, family dramas with the specific weight of shared history, workplace fiction where the office is a social ecosystem, slice-of-life that finds beauty in ordinary moments, and sports stories where competition becomes a way of understanding yourself.

This is the genre that says: real life is interesting enough.`,
    relatedGenres: ['romance', 'literary-fiction', 'historical-fiction', 'comedy-satire'],
    icon: '🏙️',
    metaTitle: 'Contemporary Fiction Web Stories | Fictionry',
    metaDescription: 'Read contemporary fiction on Fictionry. Slice-of-life, coming-of-age, family drama, workplace fiction, sports fiction, and more.',
  },
  'historical-fiction': {
    description: 'Other times, other lives. Fiction rooted in the real past.',
    longDescription: `Historical Fiction is one of the most underserved categories in web fiction, and one of the most rewarding. These stories immerse you in a time and place that no longer exists — the smell of a medieval city, the political manoeuvring of an ancient court, the day-to-day reality of people who lived in history rather than studied it.

Fictionry's Historical Fiction library spans the ancient world to the twentieth century, Eastern and Western settings, military conflict and domestic life. It includes alternate history for the "what if" readers, and rigorous historical fiction for readers who want accuracy alongside story.

The past is a foreign country, and these authors know their way around it.`,
    relatedGenres: ['literary-fiction', 'romance', 'thriller-mystery', 'fantasy'],
    icon: '📜',
    metaTitle: 'Historical Fiction Web Stories | Fictionry',
    metaDescription: 'Read historical fiction on Fictionry. Ancient world, medieval, Victorian, alternate history, war fiction, and more — serialised stories from the past.',
  },
  'literary-fiction': {
    description: 'Where prose craft, character, and ideas take the lead.',
    longDescription: `Literary Fiction is the genre that asks more of both the writer and the reader — and rewards both in proportion. Prose that earns every sentence. Characters whose interiority feels more real than real. Ideas that don't resolve neatly because important ideas rarely do.

On Fictionry, Literary Fiction is one of our differentiators. Magical realism that uses the impossible as metaphor. Autofiction that blurs the line between writer and narrator. Philosophical fiction where the ideas themselves are characters. Speculative literary fiction that borrows SF or fantasy's tools for literary ends.

This is fiction that stays with you.`,
    relatedGenres: ['contemporary-fiction', 'historical-fiction', 'horror', 'science-fiction'],
    icon: '📖',
    metaTitle: 'Literary Fiction Web Stories | Fictionry',
    metaDescription: 'Read literary fiction on Fictionry. Magical realism, autofiction, philosophical fiction, speculative literary fiction, and more.',
  },
  'paranormal-supernatural': {
    description: 'The supernatural in the everyday — not horror, not fantasy, but something in between.',
    longDescription: `Paranormal & Supernatural occupies a specific space: the supernatural is real, but the world is still recognisably ours. Not a full fantasy world with magic systems. Not primarily horror. Not romance-first (that's Paranormal Romance). Something else.

Ghost stories where the city is the haunting. Witch communities who drink coffee and argue about curse theory. Psychics navigating the ordinary world with extraordinary perception. Hidden supernatural societies beneath real cities.

These stories have a specific reader, and that reader is passionate. If you know you love this space, you'll find a home in Fictionry's Paranormal & Supernatural library.`,
    relatedGenres: ['horror', 'fantasy', 'romance', 'thriller-mystery'],
    icon: '🌙',
    metaTitle: 'Paranormal & Supernatural Web Fiction | Fictionry',
    metaDescription: 'Read paranormal and supernatural web fiction on Fictionry. Ghost stories, witches, psychics, urban supernatural, and more.',
  },
  'non-fiction-essay': {
    description: 'True stories, sharp essays, and the art of non-fiction writing.',
    longDescription: `Non-Fiction & Essay is an experiment on Fictionry — and one we believe in. Web fiction platforms have always been fiction-only. We think that's a missed opportunity.

Serialised memoir, read chapter by chapter as a life unfolds. Personal essays from writers with something to say. Craft writing for readers who want to improve. Investigative longform that goes deeper than a blog post. Travel writing that makes you feel like you're somewhere else.

Non-fiction has its own rhythm, its own relationship with truth, its own demands. Writers who do this well are doing something genuinely hard. We want to give them a platform.`,
    relatedGenres: ['literary-fiction', 'contemporary-fiction', 'historical-fiction'],
    icon: '✍️',
    metaTitle: 'Non-Fiction & Essays | Fictionry',
    metaDescription: 'Read serialised non-fiction and essays on Fictionry. Memoir, personal essays, narrative non-fiction, craft writing, and investigative longform.',
  },
  'fan-fiction': {
    description: 'Beloved characters, new stories. The creative tradition of fandom.',
    longDescription: `Fan Fiction is its own creative tradition, with its own conventions, its own language, and its own deeply engaged readership. The relationship between a fan writer and a source property is one of the most interesting creative dynamics in all of fiction — transformative, affectionate, critical, and often better than the original.

Fictionry's Fan Fiction section uses a dedicated discovery system built around fandom identity first. Find your fandom, explore the subgenres (canon compliant, AU, fix-it, crossover, RPF, and more), and discover the writers who have made it their own.

Every fic here is also classified by secondary genre, so if you want dark romance set in a particular fandom, or cozy slice-of-life, or grimdark AU — you can find it.`,
    relatedGenres: ['fantasy', 'romance', 'action-adventure', 'contemporary-fiction'],
    icon: '🌟',
    metaTitle: 'Fan Fiction | Fictionry',
    metaDescription: 'Read fan fiction on Fictionry. Find your fandom, explore canon divergent, AU, fix-it, crossover, and more across thousands of source properties.',
  },
}
