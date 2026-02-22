interface GenreSeoData {
  description: string;
  longDescription: string;
  relatedGenres: string[];
  icon: string;
  metaTitle: string;
  metaDescription: string;
}

export const GENRE_SEO: Record<string, GenreSeoData> = {
  Fantasy: {
    description:
      'Explore worlds of magic, mythical creatures, and epic quests. Fantasy stories on Fictionry transport you beyond the boundaries of reality.',
    longDescription: `Fantasy fiction invites readers into realms where magic is real, mythical creatures roam, and heroes embark on legendary quests. From sweeping world-building to intimate character-driven tales, this genre offers limitless possibilities for the imagination.

On Fictionry, you'll find a thriving community of fantasy authors crafting everything from classic sword-and-sorcery epics to modern magical realism. Whether you crave sprawling multi-book sagas or standalone adventures, our fantasy library has something for every reader.

Discover new voices and beloved serial authors who publish chapter by chapter, building worlds you can follow as they unfold. Join thousands of readers who have made Fictionry their home for the best in web fantasy fiction.`,
    relatedGenres: ['Epic Fantasy', 'Urban Fantasy', 'Adventure', 'Action'],
    icon: '🧙',
    metaTitle: 'Best Fantasy Web Fiction & Stories | Fictionry',
    metaDescription:
      'Discover top fantasy web fiction on Fictionry. Explore magical worlds, epic quests, and mythical creatures in stories updated regularly by talented authors.',
  },
  'Sci-Fi': {
    description:
      'Journey through futuristic worlds, advanced technology, and the vast unknown of space. Sci-Fi stories push the limits of imagination and science.',
    longDescription: `Science fiction explores the frontiers of human knowledge—advanced technology, space exploration, artificial intelligence, and alternate timelines. These stories ask "what if?" and dare to imagine the answers.

Fictionry hosts a diverse collection of sci-fi web fiction, from hard science narratives grounded in real physics to space operas brimming with interstellar drama. Our authors blend cutting-edge concepts with compelling characters to create stories that entertain and provoke thought.

Whether you're a fan of cyberpunk dystopias, first-contact stories, or time-bending adventures, you'll find serialized sci-fi that keeps you coming back chapter after chapter. Explore the future of fiction on Fictionry.`,
    relatedGenres: ['Thriller', 'Action', 'Adventure', 'LitRPG'],
    icon: '🚀',
    metaTitle: 'Best Sci-Fi Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read the best sci-fi web fiction on Fictionry. Explore futuristic worlds, space travel, and advanced technology in serialized stories updated regularly.',
  },
  Romance: {
    description:
      'Fall in love with heartfelt stories of connection, passion, and relationships. Romance fiction on Fictionry captures every shade of the heart.',
    longDescription: `Romance fiction is all about the journey of love—the spark of attraction, the tension of will-they-won't-they, and the satisfaction of a heartfelt connection. From sweet slow burns to passionate whirlwinds, this genre celebrates relationships in all their forms.

Fictionry's romance library spans contemporary love stories, historical courtships, paranormal pairings, and much more. Our authors craft characters you'll root for and relationships that feel genuine, keeping you turning pages late into the night.

With new chapters published regularly, you can follow your favorite love stories as they unfold. Join a passionate community of romance readers and writers on Fictionry and discover your next favorite story.`,
    relatedGenres: ['Drama', 'Comedy', 'Slice of Life', 'Historical'],
    icon: '💖',
    metaTitle: 'Best Romance Web Fiction & Stories | Fictionry',
    metaDescription:
      'Discover the best romance web fiction on Fictionry. Enjoy heartfelt love stories, slow burns, and passionate tales updated by talented serial authors.',
  },
  Horror: {
    description:
      'Dare to read tales of terror, suspense, and the supernatural. Horror fiction on Fictionry will keep you on the edge of your seat.',
    longDescription: `Horror fiction taps into our deepest fears—the unknown lurking in shadows, the monster under the bed, and the terror of things we cannot explain. These stories are designed to unsettle, thrill, and leave a lasting impression.

Fictionry's horror collection features everything from psychological dread and cosmic horror to supernatural hauntings and creature features. Our authors master the art of tension, pacing their scares across serialized chapters that build suspense week after week.

If you love stories that make your pulse race and keep you checking over your shoulder, Fictionry's horror section is your destination. Explore chilling tales from emerging and established web fiction authors.`,
    relatedGenres: ['Thriller', 'Mystery', 'Drama', 'Action'],
    icon: '👻',
    metaTitle: 'Best Horror Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read chilling horror web fiction on Fictionry. Explore supernatural terror, psychological dread, and spine-tingling stories from talented authors.',
  },
  Mystery: {
    description:
      'Unravel puzzles, follow clues, and solve crimes alongside brilliant detectives. Mystery stories on Fictionry keep you guessing until the end.',
    longDescription: `Mystery fiction challenges readers to piece together clues, uncover hidden truths, and solve puzzles before the final reveal. From classic whodunits to modern investigative thrillers, this genre rewards the curious mind.

On Fictionry, mystery authors craft intricate plots with twists and red herrings that keep readers engaged chapter after chapter. The serialized format is perfect for mysteries—each installment adds new clues and deepens the intrigue.

Whether you enjoy cozy mysteries, noir detective stories, or complex crime dramas, Fictionry's mystery library has a case waiting for you. Join a community of armchair detectives and discover your next obsession.`,
    relatedGenres: ['Thriller', 'Drama', 'Horror', 'Historical'],
    icon: '🔍',
    metaTitle: 'Best Mystery Web Fiction & Stories | Fictionry',
    metaDescription:
      'Solve mysteries with the best web fiction on Fictionry. Enjoy gripping whodunits, detective stories, and crime fiction updated regularly.',
  },
  Thriller: {
    description:
      'Experience heart-pounding suspense and high-stakes action. Thriller stories on Fictionry deliver tension and excitement on every page.',
    longDescription: `Thriller fiction is defined by relentless pacing, high stakes, and the constant question of what happens next. These stories pit protagonists against formidable threats—conspiracies, killers, ticking clocks—and never let up.

Fictionry's thriller section features serialized stories that master the art of the cliffhanger. Our authors keep readers hooked with each chapter, ratcheting up tension and delivering twists that redefine the narrative.

From political intrigue and espionage to survival stories and psychological cat-and-mouse games, you'll find thrillers that keep your heart racing. Dive into Fictionry's thriller collection and experience stories that refuse to let you put them down.`,
    relatedGenres: ['Mystery', 'Action', 'Horror', 'Sci-Fi'],
    icon: '💥',
    metaTitle: 'Best Thriller Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read gripping thriller web fiction on Fictionry. Experience high-stakes suspense, twists, and heart-pounding action in serialized stories.',
  },
  Adventure: {
    description:
      'Embark on thrilling journeys across uncharted lands and perilous seas. Adventure fiction on Fictionry is about the thrill of exploration.',
    longDescription: `Adventure fiction is the genre of exploration, discovery, and the thrill of the unknown. These stories take characters—and readers—on journeys across dangerous landscapes, lost civilizations, and uncharted territories.

Fictionry hosts a vibrant collection of adventure web fiction where authors build expansive worlds filled with challenges, treasures, and unforgettable companions. The serialized format lets these journeys unfold naturally, with each chapter a new leg of the adventure.

Whether you love treasure hunts, survival stories, or globe-trotting quests, Fictionry's adventure section will satisfy your wanderlust. Start exploring today and find your next great read.`,
    relatedGenres: ['Fantasy', 'Action', 'Sci-Fi', 'Isekai'],
    icon: '🌄',
    metaTitle: 'Best Adventure Web Fiction & Stories | Fictionry',
    metaDescription:
      'Explore adventure web fiction on Fictionry. Journey through uncharted worlds, epic quests, and thrilling expeditions in serialized stories.',
  },
  Drama: {
    description:
      'Immerse yourself in emotionally rich stories of conflict, growth, and the human experience. Drama on Fictionry explores the depths of character.',
    longDescription: `Drama fiction focuses on the emotional core of storytelling—complex characters navigating conflict, relationships, moral dilemmas, and personal growth. These stories resonate because they reflect the real struggles and triumphs of life.

On Fictionry, drama authors craft deeply character-driven narratives that explore themes of family, identity, ambition, and redemption. The serialized format allows for nuanced character development that unfolds over time, drawing readers into lives that feel real.

From intimate personal stories to sweeping family sagas, Fictionry's drama collection offers rich, rewarding reading experiences. Discover stories that move you and characters you'll never forget.`,
    relatedGenres: ['Romance', 'Slice of Life', 'Historical', 'Comedy'],
    icon: '🎭',
    metaTitle: 'Best Drama Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read compelling drama web fiction on Fictionry. Explore emotionally rich stories of conflict, growth, and the human experience from talented authors.',
  },
  Comedy: {
    description:
      'Laugh out loud with witty, humorous, and feel-good stories. Comedy fiction on Fictionry is the perfect pick-me-up.',
    longDescription: `Comedy fiction is about joy, laughter, and the lighter side of storytelling. From sharp wit and satirical commentary to slapstick humor and heartwarming charm, these stories are designed to make you smile.

Fictionry's comedy collection showcases authors with a gift for timing, dialogue, and absurdity. Whether it's a comedic fantasy romp, a humorous slice-of-life serial, or a satirical take on genre tropes, you'll find stories that brighten your day.

The serialized format is perfect for comedy—each chapter delivers fresh laughs and keeps the fun going. Explore Fictionry's comedy section and discover stories that prove fiction is best when it doesn't take itself too seriously.`,
    relatedGenres: ['Slice of Life', 'Romance', 'Drama', 'Adventure'],
    icon: '😂',
    metaTitle: 'Best Comedy Web Fiction & Stories | Fictionry',
    metaDescription:
      'Enjoy the funniest web fiction on Fictionry. Discover witty, humorous, and feel-good stories that will keep you laughing chapter after chapter.',
  },
  Action: {
    description:
      'Dive into fast-paced stories packed with battles, chases, and adrenaline. Action fiction on Fictionry delivers non-stop excitement.',
    longDescription: `Action fiction is all about momentum—explosive battles, daring escapes, and protagonists who fight against impossible odds. These stories grab you from the first page and never let go.

On Fictionry, action authors excel at crafting visceral combat scenes, strategic showdowns, and pulse-pounding sequences that keep readers on the edge of their seats. The serialized format amplifies the excitement with each chapter ending on a high note.

From martial arts showdowns to epic battlefield clashes, Fictionry's action library is packed with stories that deliver the thrills you crave. Jump in and experience fiction at full speed.`,
    relatedGenres: ['Adventure', 'Thriller', 'Fantasy', 'Wuxia'],
    icon: '⚔️',
    metaTitle: 'Best Action Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read action-packed web fiction on Fictionry. Enjoy fast-paced battles, epic showdowns, and adrenaline-fueled stories from top serial authors.',
  },
  Historical: {
    description:
      'Step back in time with richly detailed stories set in past eras. Historical fiction on Fictionry brings history to vivid life.',
    longDescription: `Historical fiction transports readers to bygone eras, weaving fictional narratives through real historical settings and events. These stories illuminate the past while telling timeless tales of love, war, ambition, and survival.

Fictionry's historical fiction collection features authors who bring meticulous research and vivid imagination together. From ancient civilizations to world wars, these serialized stories immerse you in the sights, sounds, and struggles of different times.

Whether you're drawn to royal courts, frontier settlements, or revolutionary movements, you'll find historical web fiction on Fictionry that educates as it entertains. Explore the past through the eyes of compelling characters.`,
    relatedGenres: ['Drama', 'Romance', 'Mystery', 'Adventure'],
    icon: '🏰',
    metaTitle: 'Best Historical Web Fiction & Stories | Fictionry',
    metaDescription:
      'Discover historical web fiction on Fictionry. Explore richly detailed stories set in past eras, from ancient civilizations to modern history.',
  },
  'Slice of Life': {
    description:
      'Enjoy gentle, everyday stories that find beauty in the ordinary. Slice of Life fiction on Fictionry celebrates the quiet moments.',
    longDescription: `Slice of Life fiction captures the beauty of everyday existence—mundane moments elevated through careful observation, relatable characters, and emotional authenticity. These stories don't need epic battles or grand quests to be compelling.

On Fictionry, Slice of Life authors craft warm, character-driven narratives about friendship, family, work, and the small joys that make life meaningful. The serialized format is ideal for this genre, letting readers check in on beloved characters regularly.

If you appreciate stories that feel like a warm cup of tea—comforting, genuine, and quietly profound—Fictionry's Slice of Life collection is for you. Slow down, relax, and enjoy fiction that celebrates the everyday.`,
    relatedGenres: ['Drama', 'Comedy', 'Romance', 'Historical'],
    icon: '☕',
    metaTitle: 'Best Slice of Life Web Fiction | Fictionry',
    metaDescription:
      'Read heartwarming Slice of Life web fiction on Fictionry. Enjoy gentle, everyday stories that celebrate the beauty of ordinary moments.',
  },
  'Urban Fantasy': {
    description:
      'Discover magic hidden in modern cities and contemporary settings. Urban Fantasy blends the mundane with the supernatural.',
    longDescription: `Urban Fantasy brings magic into the modern world—hidden societies of wizards in bustling cities, supernatural creatures lurking in subway tunnels, and ordinary people discovering extraordinary powers. It's fantasy with a contemporary edge.

Fictionry's Urban Fantasy library features stories that blend the familiar with the fantastic. Our authors create rich modern settings infused with magical elements, crafting narratives that feel both grounded and wondrous.

From detective stories with a magical twist to coming-of-age tales set against urban supernatural backdrops, this genre offers a unique reading experience. Explore Fictionry's Urban Fantasy collection and see the modern world through a magical lens.`,
    relatedGenres: ['Fantasy', 'Mystery', 'Action', 'Horror'],
    icon: '🌃',
    metaTitle: 'Best Urban Fantasy Web Fiction | Fictionry',
    metaDescription:
      'Read Urban Fantasy web fiction on Fictionry. Discover stories where magic meets the modern world in thrilling supernatural adventures.',
  },
  'Epic Fantasy': {
    description:
      'Lose yourself in sprawling worlds with complex magic systems and grand conflicts. Epic Fantasy on Fictionry delivers stories of legendary scale.',
    longDescription: `Epic Fantasy is the genre of grand scope—vast worlds with detailed magic systems, complex political landscapes, and conflicts that shape the fate of nations. These stories feature large casts of characters and narratives that span years or even centuries.

On Fictionry, Epic Fantasy authors thrive in the serialized format, building immense worlds chapter by chapter and giving readers time to fully absorb the depth and complexity of their creations. Many of our most followed stories fall in this genre.

If you love intricate world-building, morally complex characters, and stories where the stakes couldn't be higher, Fictionry's Epic Fantasy collection will keep you reading for months. Start your next great saga today.`,
    relatedGenres: ['Fantasy', 'Adventure', 'Action', 'Progression Fantasy'],
    icon: '🐉',
    metaTitle: 'Best Epic Fantasy Web Fiction | Fictionry',
    metaDescription:
      'Discover epic fantasy web fiction on Fictionry. Explore vast worlds, complex magic systems, and grand conflicts in serialized stories.',
  },
  LitRPG: {
    description:
      'Level up with stories that blend gaming mechanics, stats, and progression into rich narratives. LitRPG is fiction meets gaming.',
    longDescription: `LitRPG combines the best of gaming and fiction—characters navigating worlds governed by game-like mechanics complete with stats, levels, skills, and loot. These stories appeal to gamers and fantasy readers alike with their unique blend of progression and narrative.

Fictionry is one of the top destinations for LitRPG web fiction. Our authors craft detailed systems, satisfying power progression, and engaging plots that make every level-up feel earned. The serialized format is a natural fit for a genre built around incremental growth.

Whether you prefer dungeon crawlers, VRMMO adventures, or system apocalypse scenarios, Fictionry's LitRPG library has the story for you. Join a passionate community of LitRPG fans and find your next binge-worthy serial.`,
    relatedGenres: ['Gamelit', 'Progression Fantasy', 'Fantasy', 'Isekai'],
    icon: '🎮',
    metaTitle: 'Best LitRPG Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read the best LitRPG web fiction on Fictionry. Enjoy stories with stats, levels, and gaming mechanics woven into epic fantasy narratives.',
  },
  Gamelit: {
    description:
      'Experience stories set in game-like worlds with lighter mechanics. Gamelit fiction on Fictionry focuses on adventure with a gaming twist.',
    longDescription: `Gamelit fiction shares DNA with LitRPG but takes a broader approach—stories set in game-inspired worlds where mechanics exist but don't dominate the narrative. The focus is on adventure, characters, and story, with gaming elements adding flavor.

On Fictionry, Gamelit authors strike the perfect balance between system elements and traditional storytelling. You'll find stories with game-like worlds that prioritize plot and character development while still offering the satisfaction of progression.

If you enjoy the concept of game worlds but prefer stories where the narrative takes center stage, Fictionry's Gamelit collection is perfect for you. Explore a genre that brings the best of both worlds together.`,
    relatedGenres: ['LitRPG', 'Fantasy', 'Adventure', 'Isekai'],
    icon: '🕹️',
    metaTitle: 'Best Gamelit Web Fiction & Stories | Fictionry',
    metaDescription:
      'Discover Gamelit web fiction on Fictionry. Enjoy game-inspired stories that blend adventure, progression, and compelling narratives.',
  },
  Xianxia: {
    description:
      'Cultivate immortality in stories inspired by Chinese mythology and martial arts. Xianxia fiction features powerful cultivators ascending to godhood.',
    longDescription: `Xianxia fiction draws from Chinese mythology and philosophy, following cultivators on their path to immortality and godhood. These stories feature complex cultivation systems, heavenly tribulations, and vast power hierarchies that span mortal and divine realms.

Fictionry's Xianxia collection features both translations and original English-language stories that capture the essence of the genre. Our authors build intricate cultivation worlds with sects, treasures, and martial techniques that reward dedicated readers.

If you love stories about transcending human limits, navigating political intrigue between powerful sects, and ascending through the heavens, Fictionry's Xianxia library awaits. Experience one of the most popular genres in web fiction.`,
    relatedGenres: ['Wuxia', 'Progression Fantasy', 'Action', 'Fantasy'],
    icon: '☯️',
    metaTitle: 'Best Xianxia Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read top Xianxia web fiction on Fictionry. Follow cultivators on paths to immortality in stories inspired by Chinese mythology and martial arts.',
  },
  Wuxia: {
    description:
      'Master martial arts in stories of honor, justice, and legendary warriors. Wuxia fiction celebrates the chivalrous hero of Chinese tradition.',
    longDescription: `Wuxia fiction celebrates the martial arts hero—a warrior bound by a code of honor who fights for justice in a world of rival sects, hidden techniques, and ancient grudges. Rooted in Chinese literary tradition, Wuxia emphasizes skill, loyalty, and the human spirit.

On Fictionry, Wuxia stories bring the genre's rich traditions to English-speaking audiences. Our authors craft tales of wandering swordsmen, martial arts tournaments, and the pursuit of legendary techniques with authentic attention to the genre's roots.

Whether you're a longtime Wuxia fan or discovering the genre for the first time, Fictionry offers stories that honor the tradition while making it accessible. Explore tales of martial valor and chivalric adventure.`,
    relatedGenres: ['Xianxia', 'Action', 'Historical', 'Adventure'],
    icon: '🥋',
    metaTitle: 'Best Wuxia Web Fiction & Stories | Fictionry',
    metaDescription:
      'Discover Wuxia web fiction on Fictionry. Enjoy martial arts stories of honor, legendary warriors, and chivalrous heroes in the Chinese tradition.',
  },
  Isekai: {
    description:
      'Travel to another world and start a new life with unexpected powers. Isekai fiction on Fictionry reimagines the transported-hero adventure.',
    longDescription: `Isekai fiction follows characters who are transported, reincarnated, or summoned into another world—often one with magic, game-like systems, or entirely different rules of reality. Armed with knowledge from their previous life, these protagonists carve out new destinies.

Fictionry's Isekai library is packed with creative takes on the genre. Our authors go beyond the standard tropes, offering unique world-building, compelling power systems, and protagonists who bring fresh perspectives to their new realities.

From reincarnation stories and summoned hero tales to accidental dimension-hoppers and second-chance narratives, you'll find Isekai stories that surprise and delight. Explore Fictionry's Isekai collection and discover your next portal to another world.`,
    relatedGenres: ['Fantasy', 'LitRPG', 'Adventure', 'Progression Fantasy'],
    icon: '🌀',
    metaTitle: 'Best Isekai Web Fiction & Stories | Fictionry',
    metaDescription:
      'Read the best Isekai web fiction on Fictionry. Explore transported-hero adventures, reincarnation stories, and new world discoveries.',
  },
  'Progression Fantasy': {
    description:
      'Follow characters as they grow from humble beginnings to extraordinary power. Progression Fantasy is the genre of satisfying growth.',
    longDescription: `Progression Fantasy is all about the journey from weakness to strength. Characters train, learn, and overcome challenges to steadily grow in power, skill, and understanding. The satisfaction of watching a protagonist earn every advancement is what makes this genre addictive.

Fictionry is a premier destination for Progression Fantasy web fiction. Our authors excel at crafting magic systems, training arcs, and power scales that make every breakthrough feel earned. The serialized format is a perfect match—readers experience the progression in real time.

Whether you prefer cultivation-style advancement, academic magic schools, or unique power systems, Fictionry's Progression Fantasy library offers some of the best stories in the genre. Start reading and experience the thrill of the climb.`,
    relatedGenres: ['LitRPG', 'Fantasy', 'Xianxia', 'Epic Fantasy'],
    icon: '📈',
    metaTitle: 'Best Progression Fantasy Web Fiction | Fictionry',
    metaDescription:
      'Discover progression fantasy web fiction on Fictionry. Follow characters growing from humble beginnings to extraordinary power in serialized stories.',
  },
};

/**
 * Get SEO data for a genre. Returns a sensible default if the genre is not found.
 */
export function getGenreSeo(genre: string): GenreSeoData {
  if (GENRE_SEO[genre]) {
    return GENRE_SEO[genre];
  }

  // Return a sensible default for unknown genres
  return {
    description: `Discover the best ${genre} stories on Fictionry. Browse web fiction from talented authors in this genre.`,
    longDescription: `${genre} is a popular genre on Fictionry, home to a growing collection of web fiction from talented authors around the world.

Our ${genre} library features serialized stories updated regularly, giving you fresh content to enjoy every week. Whether you're new to the genre or a longtime fan, you'll find stories that capture your imagination.

Browse our ${genre} collection and discover your next favorite story on Fictionry.`,
    relatedGenres: ['Fantasy', 'Adventure', 'Sci-Fi', 'Action'],
    icon: '📚',
    metaTitle: `Best ${genre} Web Fiction & Stories | Fictionry`,
    metaDescription: `Read the best ${genre} web fiction on Fictionry. Discover stories from talented authors updated regularly.`,
  };
}

/**
 * Convert a genre name to a URL-friendly slug.
 */
export function genreToSlug(genre: string): string {
  return encodeURIComponent(genre);
}

/**
 * Convert a URL slug back to a genre name.
 */
export function slugToGenre(slug: string): string {
  return decodeURIComponent(slug);
}
