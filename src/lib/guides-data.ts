export type GuideSection = {
  title: string
  content: string
  screenshotPlaceholder?: string
}

export type Guide = {
  slug: string
  category: string
  title: string
  description: string
  icon: string
  readTime: string
  sections: GuideSection[]
}

export type GuideCategory = {
  slug: string
  title: string
  description: string
  icon: string
  guides: Guide[]
}

export const guideCategories: GuideCategory[] = [
  {
    slug: 'authors',
    title: 'For Authors',
    description: 'Everything you need to publish, grow, and monetize your web fiction on FictionForge.',
    icon: 'Pen',
    guides: [
      {
        slug: 'getting-started',
        category: 'authors',
        title: 'Publishing Your First Story',
        description: 'Create your account, set up your first story, write your opening chapter, and hit publish.',
        icon: 'BookOpen',
        readTime: '8 min read',
        sections: [
          {
            title: 'Creating Your Author Account',
            content: '<p class="text-muted-foreground mb-4">Getting started on FictionForge takes just a minute. Head to the signup page and create your account with an email address or sign in with Google. Once you\'re in, you\'ll want to set up your author profile — this is what readers see when they discover your work.</p><p class="text-muted-foreground mb-4">Navigate to your profile settings and add a display name, bio, and avatar. Your bio is your chance to tell readers who you are and what kind of stories you write. Keep it friendly and authentic — readers connect with authors who feel approachable.</p>',
            screenshotPlaceholder: 'The FictionForge signup page with email and Google sign-in options'
          },
          {
            title: 'Setting Up Your First Story',
            content: '<p class="text-muted-foreground mb-4">Click "New Story" from your author dashboard to get started. You\'ll need to fill in some key details:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Title</strong> — Choose something that hooks readers. You can always change it later.</li><li><strong class="text-foreground">Description</strong> — A compelling synopsis that tells readers what to expect. Aim for 2–3 paragraphs.</li><li><strong class="text-foreground">Genre & Tags</strong> — Select a primary genre and add relevant tags so readers can find your story through browse and search.</li><li><strong class="text-foreground">Cover Image</strong> — Stories with covers get significantly more clicks. Even a simple cover is better than none.</li><li><strong class="text-foreground">Content Warnings</strong> — Be transparent about mature themes. This builds trust with your audience.</li></ul>',
            screenshotPlaceholder: 'The new story creation form with title, description, genre, and cover upload fields'
          },
          {
            title: 'Writing Your First Chapter',
            content: '<p class="text-muted-foreground mb-4">With your story set up, it\'s time to write. Click "Add Chapter" and you\'ll be taken to our rich text editor. The editor supports everything you need — bold, italic, headings, links, images, and even LitRPG stat boxes if your story calls for them.</p><p class="text-muted-foreground mb-4">Give your chapter a title (or just number it — both approaches work well). Then start writing. The editor auto-saves your work every few seconds, so you never have to worry about losing progress.</p><div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">💡 Tip:</strong> Many successful authors on FictionForge recommend having at least 3–5 chapters ready before publishing. This gives new readers enough content to get hooked on your story.</p></div>',
            screenshotPlaceholder: 'The chapter editor showing the rich text toolbar and writing area'
          },
          {
            title: 'Publishing and Sharing',
            content: '<p class="text-muted-foreground mb-4">When you\'re ready, hit the "Publish" button on your chapter. You can publish chapters one at a time or use the scheduling feature to release them on a regular cadence. Consistent schedules help build a loyal readership.</p><p class="text-muted-foreground mb-4">Once published, your story will appear in the browse pages and become searchable. Share the link on your social media, writing communities, and anywhere your potential readers hang out. The first few readers are the hardest to get — after that, word of mouth does a lot of the work.</p><div class="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">🎉 Tip:</strong> Engage with comments on your chapters. Readers who feel heard become your biggest advocates and help spread the word about your story.</p></div>',
            screenshotPlaceholder: 'The publish confirmation dialog with scheduling options'
          }
        ]
      },
      {
        slug: 'formatting',
        category: 'authors',
        title: 'Formatting & Editor Guide',
        description: 'Master the TipTap editor with bold, italic, headings, author notes, content warnings, and more.',
        icon: 'Type',
        readTime: '6 min read',
        sections: [
          {
            title: 'Editor Overview',
            content: '<p class="text-muted-foreground mb-4">FictionForge uses a powerful rich text editor that gives you full control over your chapter formatting. The toolbar at the top of the editor provides quick access to all formatting options, and keyboard shortcuts are available for everything.</p><p class="text-muted-foreground mb-4">The editor is designed to feel familiar — if you\'ve used Google Docs or Word, you\'ll be right at home. But it also includes web fiction-specific features that those tools don\'t have.</p>',
            screenshotPlaceholder: 'The full editor toolbar showing all formatting options'
          },
          {
            title: 'Basic Formatting',
            content: '<p class="text-muted-foreground mb-4">The essentials are all here and work exactly as you\'d expect:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Bold</strong> (Ctrl+B) — For emphasis and important terms</li><li><em class="text-foreground">Italic</em> (Ctrl+I) — For thoughts, foreign words, or subtle emphasis</li><li><u class="text-foreground">Underline</u> (Ctrl+U) — Available but used sparingly in web fiction</li><li><strong class="text-foreground">Strikethrough</strong> — Great for showing edited text or crossed-out thoughts</li><li><strong class="text-foreground">Headings</strong> — H1 through H4 for chapter sections and scene breaks</li></ul><p class="text-muted-foreground mb-4">You can also create ordered and unordered lists, blockquotes (perfect for letters or documents within your story), and horizontal rules for scene breaks.</p>',
            screenshotPlaceholder: 'Examples of bold, italic, headings, and blockquote formatting in the editor'
          },
          {
            title: 'Advanced Features',
            content: '<p class="text-muted-foreground mb-4">FictionForge\'s editor goes beyond basic formatting to support features popular in web fiction:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Tables</strong> — Create stat blocks, skill descriptions, or any tabular data. Resize columns by dragging.</li><li><strong class="text-foreground">Images</strong> — Upload images directly into your chapters for maps, character art, or diagrams.</li><li><strong class="text-foreground">Links</strong> — Link to other chapters, your Patreon, or external resources.</li><li><strong class="text-foreground">Text Alignment</strong> — Left, center, right, and justify options for special formatting needs.</li></ul>',
            screenshotPlaceholder: 'A table being edited in the chapter editor, showing a LitRPG stat block'
          },
          {
            title: 'Author Notes & Content Warnings',
            content: '<p class="text-muted-foreground mb-4">Author notes let you communicate directly with your readers before or after a chapter. Use them to share context, thank readers, or discuss your writing process. They appear in a distinct styled box so readers know it\'s you speaking, not the narrative.</p><p class="text-muted-foreground mb-4">Content warnings can be set per-chapter for specific triggers that might not apply to your story overall. These are displayed before the chapter content with a toggle, so readers can make informed choices.</p><div class="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">⚠️ Note:</strong> Always use content warnings when a chapter contains violence, strong language, or sensitive themes beyond what your story\'s overall rating suggests. Your readers will appreciate the heads up.</p></div>',
            screenshotPlaceholder: 'An author note box and content warning toggle as they appear to readers'
          }
        ]
      },
      {
        slug: 'monetization',
        category: 'authors',
        title: 'Setting Up Monetization',
        description: 'Connect Stripe, create subscriber tiers, set up advance chapters, and understand payouts.',
        icon: 'DollarSign',
        readTime: '10 min read',
        sections: [
          {
            title: 'Overview of Monetization',
            content: '<p class="text-muted-foreground mb-4">FictionForge allows authors to earn money directly from their writing through subscriber tiers. Readers can subscribe to support you and gain access to advance chapters — chapters that are available early to paying supporters before being released to everyone.</p><p class="text-muted-foreground mb-4">Monetization is entirely optional. Many authors choose to keep their work fully free, and that\'s perfectly fine. But if you want to turn your writing into income, we\'ve built the tools to make it straightforward.</p>',
          },
          {
            title: 'Connecting Stripe',
            content: '<p class="text-muted-foreground mb-4">FictionForge uses Stripe Connect to handle payments securely. To get started, navigate to your Author Dashboard and click "Set Up Monetization." You\'ll be redirected to Stripe to create or connect your account.</p><p class="text-muted-foreground mb-4">Stripe will ask for some identity verification — this is required by financial regulations and keeps everyone safe. The process typically takes a few minutes, though verification can sometimes take up to 24 hours.</p><div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">💡 Tip:</strong> Make sure your Stripe account details are accurate. Incorrect information can delay payouts.</p></div>',
            screenshotPlaceholder: 'The monetization setup page with the Stripe Connect button'
          },
          {
            title: 'Creating Subscriber Tiers',
            content: '<p class="text-muted-foreground mb-4">Once Stripe is connected, you can create subscriber tiers. Each tier has a monthly price and a number of advance chapters that subscribers get access to. For example:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Supporter ($3/mo)</strong> — 5 advance chapters</li><li><strong class="text-foreground">Super Fan ($5/mo)</strong> — 10 advance chapters</li><li><strong class="text-foreground">Patron ($10/mo)</strong> — 20 advance chapters + bonus content</li></ul><p class="text-muted-foreground mb-4">You set the price and chapter count. Think about your release schedule — if you publish 5 chapters a week, offering 10 advance chapters means subscribers are about 2 weeks ahead.</p>',
            screenshotPlaceholder: 'The tier creation form showing price and advance chapter settings'
          },
          {
            title: 'Managing Advance Chapters',
            content: '<p class="text-muted-foreground mb-4">When you publish a chapter, you can mark it as an advance chapter. This makes it immediately available to subscribers at the appropriate tier, but hidden from free readers. You then set a date when it becomes free for everyone.</p><p class="text-muted-foreground mb-4">The easiest workflow is to always publish as advance and use scheduling. Write chapters, publish them for subscribers, and schedule them to go free on a rolling basis. FictionForge handles the rest automatically.</p>',
            screenshotPlaceholder: 'Chapter publish dialog showing advance chapter toggle and free release date'
          },
          {
            title: 'Understanding Payouts',
            content: '<p class="text-muted-foreground mb-4">FictionForge processes payouts through Stripe. After readers subscribe, the funds (minus Stripe\'s processing fees and the platform fee) are available in your Stripe balance. You can then transfer them to your bank account through Stripe\'s dashboard.</p><p class="text-muted-foreground mb-4">The platform fee is transparent and helps keep FictionForge running and improving. You can view a full breakdown of your earnings, subscriber count, and payout history in your Author Dashboard under "Earnings."</p>',
            screenshotPlaceholder: 'The earnings dashboard showing revenue breakdown and payout history'
          }
        ]
      },
      {
        slug: 'analytics',
        category: 'authors',
        title: 'Understanding Your Analytics',
        description: 'Learn what your dashboard metrics mean and how to use reader insights to grow your audience.',
        icon: 'BarChart3',
        readTime: '5 min read',
        sections: [
          {
            title: 'Your Analytics Dashboard',
            content: '<p class="text-muted-foreground mb-4">The author analytics dashboard gives you a clear picture of how your stories are performing. Access it from your Author Dashboard by clicking "Stats." Here you\'ll find an overview of your key metrics over customizable time periods.</p>',
            screenshotPlaceholder: 'The analytics dashboard overview showing key metrics and charts'
          },
          {
            title: 'Key Metrics Explained',
            content: '<p class="text-muted-foreground mb-4">Understanding what each metric means helps you make better decisions about your writing:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Views</strong> — Total chapter page loads. One reader reading 10 chapters counts as 10 views.</li><li><strong class="text-foreground">Unique Readers</strong> — Individual people who read your content. A better measure of audience size.</li><li><strong class="text-foreground">Followers</strong> — Readers who subscribed to get notified when you publish new chapters.</li><li><strong class="text-foreground">Read-through Rate</strong> — What percentage of readers who start chapter 1 make it to your latest chapter. This is your most important metric for story quality.</li><li><strong class="text-foreground">Engagement</strong> — Comments, likes, and bookmarks across your chapters.</li></ul>',
          },
          {
            title: 'Using Insights to Grow',
            content: '<p class="text-muted-foreground mb-4">Your analytics tell a story about your story. Here are some patterns to watch for:</p><p class="text-muted-foreground mb-4"><strong class="text-foreground">Sharp drop-offs after specific chapters</strong> may indicate pacing issues or a plot point that didn\'t land well. Consider revisiting those sections.</p><p class="text-muted-foreground mb-4"><strong class="text-foreground">Spikes in views</strong> often correspond to external sharing — check if someone recommended your story on Reddit or social media and engage with that community.</p><p class="text-muted-foreground mb-4"><strong class="text-foreground">High follower-to-view ratio</strong> means your existing readers are loyal. Focus on consistency to keep them engaged.</p><div class="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">🎉 Tip:</strong> Don\'t obsess over daily numbers. Look at weekly and monthly trends instead — they paint a much more accurate picture of your growth.</p></div>',
          },
          {
            title: 'Chapter-Level Analytics',
            content: '<p class="text-muted-foreground mb-4">Drill down into individual chapter performance to see views, likes, and comments per chapter. This helps you understand which chapters resonate most with readers and which might need revision.</p><p class="text-muted-foreground mb-4">Pay special attention to your first three chapters — they\'re where most readers decide whether to continue. If you see a big drop between chapters 1 and 3, consider strengthening your opening.</p>',
            screenshotPlaceholder: 'Chapter-level analytics showing per-chapter views and engagement'
          }
        ]
      },
      {
        slug: 'scheduling',
        category: 'authors',
        title: 'Managing Chapters & Drafts',
        description: 'Master the draft workflow, chapter ordering, scheduling, and bulk operations.',
        icon: 'Calendar',
        readTime: '5 min read',
        sections: [
          {
            title: 'The Draft Workflow',
            content: '<p class="text-muted-foreground mb-4">Every chapter starts as a draft. Drafts are private — only you can see them. This gives you space to write, revise, and polish before anyone else reads your work.</p><p class="text-muted-foreground mb-4">From the chapter management page, you can see all your chapters organized by status: Draft, Scheduled, Published, and Advance. This makes it easy to manage even stories with hundreds of chapters.</p>',
            screenshotPlaceholder: 'The chapter management page showing chapters in different statuses'
          },
          {
            title: 'Scheduling Chapters',
            content: '<p class="text-muted-foreground mb-4">Scheduling is one of the most powerful features for maintaining a consistent release cadence. When publishing a chapter, toggle on scheduling and pick a date and time. The chapter will automatically go live at that moment.</p><p class="text-muted-foreground mb-4">Many authors batch-write chapters on weekends and schedule them throughout the week. This keeps your readers happy with regular releases while giving you flexibility in your writing time.</p><div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">💡 Tip:</strong> Set a consistent schedule (e.g., Monday/Wednesday/Friday at 6 PM) and stick to it. Readers love predictability and will build your release times into their routine.</p></div>',
            screenshotPlaceholder: 'The scheduling interface with date and time picker'
          },
          {
            title: 'Reordering Chapters',
            content: '<p class="text-muted-foreground mb-4">Need to reorganize your chapters? The chapter management page supports drag-and-drop reordering. Simply grab a chapter by its handle and drag it to the new position. Chapter numbers will automatically update.</p><p class="text-muted-foreground mb-4">This is particularly useful if you decide to add a prologue, interlude, or bonus chapter between existing ones.</p>',
            screenshotPlaceholder: 'Drag-and-drop chapter reordering in action'
          },
          {
            title: 'Bulk Operations',
            content: '<p class="text-muted-foreground mb-4">For stories with many chapters, individual management can be tedious. Use the bulk select feature to select multiple chapters and perform actions on all of them at once — like publishing several drafts, deleting test chapters, or changing visibility.</p>',
          }
        ]
      },
      {
        slug: 'importing',
        category: 'authors',
        title: 'Importing Your Existing Work',
        description: 'Bring your stories from other platforms using EPUB, DOCX import, or the paste tool.',
        icon: 'Upload',
        readTime: '7 min read',
        sections: [
          {
            title: 'Import Options Overview',
            content: '<p class="text-muted-foreground mb-4">Already have stories published elsewhere? FictionForge makes it easy to bring your existing work over. We support three import methods:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">EPUB Import</strong> — Best for stories exported from Royal Road or AO3. Preserves chapters and most formatting.</li><li><strong class="text-foreground">DOCX Import</strong> — Great for stories written in Word or Google Docs. Handles common formatting well.</li><li><strong class="text-foreground">Paste Tool</strong> — For platforms without export options. Paste multiple chapters at once with automatic splitting.</li></ul>',
          },
          {
            title: 'Importing from EPUB',
            content: '<p class="text-muted-foreground mb-4">EPUB is the most reliable import format. If your platform lets you download your story as an EPUB file, this is the way to go.</p><ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Navigate to your story on FictionForge (create it first if you haven\'t)</li><li>Go to Chapters → Import</li><li>Select "EPUB" as your import format</li><li>Upload your .epub file</li><li>FictionForge will parse the file and show you a preview of the detected chapters</li><li>Review the chapter titles and content, make any adjustments</li><li>Click "Import All" to create the chapters as drafts</li></ol><div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">💡 Tip:</strong> Always review imported chapters before publishing. Some formatting may not transfer perfectly and may need minor touch-ups.</p></div>',
            screenshotPlaceholder: 'The EPUB import interface showing detected chapters ready for import'
          },
          {
            title: 'Importing from DOCX',
            content: '<p class="text-muted-foreground mb-4">If your story lives in a Word document or you exported from Google Docs as .docx, you can import it directly.</p><ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Go to Chapters → Import and select "DOCX"</li><li>Upload your .docx file</li><li>FictionForge will attempt to split the document into chapters based on heading levels</li><li>Review and adjust chapter breaks as needed</li><li>Import as drafts</li></ol><p class="text-muted-foreground mb-4">DOCX import works best when your document uses proper heading styles (Heading 1 or Heading 2) for chapter titles. If your doc doesn\'t use headings, the entire content may import as a single chapter — you can manually split it afterward.</p>',
            screenshotPlaceholder: 'The DOCX import showing chapter detection settings'
          },
          {
            title: 'Using the Paste Tool',
            content: '<p class="text-muted-foreground mb-4">The paste tool is your best option when you can\'t export a file from your current platform. It\'s designed for copying and pasting content directly.</p><ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Go to Chapters → Import and select "Paste"</li><li>Copy your chapter content from the source platform</li><li>Paste it into the text area</li><li>Use the chapter separator to split multiple chapters (e.g., a line containing only "---" or "Chapter X")</li><li>Preview the split and adjust</li><li>Import as drafts</li></ol><p class="text-muted-foreground mb-4">The paste tool handles basic formatting like bold, italic, and paragraphs. Complex formatting like tables may need to be recreated manually.</p>',
            screenshotPlaceholder: 'The paste import tool with chapter splitting options'
          }
        ]
      }
    ]
  },
  {
    slug: 'readers',
    title: 'For Readers',
    description: 'Discover stories, customize your reading experience, and get the most out of FictionForge.',
    icon: 'BookOpen',
    guides: [
      {
        slug: 'getting-started',
        category: 'readers',
        title: 'Finding Your Next Great Read',
        description: 'Browse, search, explore genres, and follow stories you love.',
        icon: 'Search',
        readTime: '5 min read',
        sections: [
          {
            title: 'Browsing Stories',
            content: '<p class="text-muted-foreground mb-4">FictionForge has thousands of stories across dozens of genres. The Browse page is your starting point for discovery. You can filter by genre, sort by popularity, recent updates, or rating, and see at a glance what\'s trending.</p><p class="text-muted-foreground mb-4">Each story card shows the title, cover, genre tags, chapter count, and a brief synopsis. Click any card to visit the story page where you can read the full description and start reading.</p>',
            screenshotPlaceholder: 'The browse page showing story cards with genre filters active'
          },
          {
            title: 'Searching for Stories',
            content: '<p class="text-muted-foreground mb-4">Know what you\'re looking for? Use the search bar to find stories by title, author name, or tags. Search results update in real-time as you type, making it fast to find exactly what you want.</p><p class="text-muted-foreground mb-4">You can also search within specific genres or combine search with filters for precise results. Looking for a completed LitRPG with over 100 chapters? You can find it.</p>',
            screenshotPlaceholder: 'Search results page with filters applied'
          },
          {
            title: 'Following Stories & Authors',
            content: '<p class="text-muted-foreground mb-4">When you find a story you love, click the "Follow" button to add it to your library. You\'ll get notified whenever the author publishes a new chapter, so you never miss an update.</p><p class="text-muted-foreground mb-4">You can also follow authors directly to be notified when they start new stories. Your library page shows all your followed stories with their latest update status, making it easy to catch up on your reading list.</p>',
            screenshotPlaceholder: 'The reader library showing followed stories with update indicators'
          },
          {
            title: 'Discovering New Genres',
            content: '<p class="text-muted-foreground mb-4">Not sure what to read next? Check out the Genres page for a curated overview of every genre on the platform. Each genre page shows the most popular and recently updated stories in that category.</p><p class="text-muted-foreground mb-4">FictionForge also features Community Picks and Featured stories — curated selections that highlight exceptional writing across the platform. These are great for discovering hidden gems you might not find through browsing alone.</p>',
          }
        ]
      },
      {
        slug: 'reading-experience',
        category: 'readers',
        title: 'Customizing Your Reading Experience',
        description: 'Adjust themes, fonts, font size, and reading modes to read comfortably.',
        icon: 'Settings',
        readTime: '4 min read',
        sections: [
          {
            title: 'Theme & Appearance',
            content: '<p class="text-muted-foreground mb-4">FictionForge offers multiple reading themes to suit your preferences and environment. Access reading settings by clicking the settings icon while reading any chapter.</p><p class="text-muted-foreground mb-4">Available themes include dark mode (default), light mode, and sepia for a warm, paper-like feel. Each theme is carefully designed for comfortable extended reading sessions.</p>',
            screenshotPlaceholder: 'The reading settings panel showing theme options'
          },
          {
            title: 'Font & Size Options',
            content: '<p class="text-muted-foreground mb-4">Everyone reads differently. FictionForge lets you choose from several font families — including serif fonts for a traditional book feel and sans-serif for modern clarity. You can also adjust font size with a slider to find your perfect reading size.</p><p class="text-muted-foreground mb-4">Line height and content width are also adjustable. Prefer narrow columns like a paperback? Or wide text that fills your screen? It\'s entirely up to you.</p>',
            screenshotPlaceholder: 'Font and size settings with preview of different options'
          },
          {
            title: 'Reading Modes',
            content: '<p class="text-muted-foreground mb-4">FictionForge supports continuous scrolling, letting you read through an entire chapter without clicking "next page." On mobile, swipe gestures let you quickly move between chapters.</p><p class="text-muted-foreground mb-4">Keyboard shortcuts are available on desktop: arrow keys or J/K for chapter navigation, and your reading position is automatically saved so you can pick up right where you left off on any device.</p><div class="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">🎉 Tip:</strong> Your reading preferences sync across all your devices. Set them once and enjoy the same experience everywhere.</p></div>',
          }
        ]
      },
      {
        slug: 'premium',
        category: 'readers',
        title: 'Reader Premium',
        description: 'Learn about premium benefits, how to subscribe, and managing your subscription.',
        icon: 'Crown',
        readTime: '4 min read',
        sections: [
          {
            title: 'What is Reader Premium?',
            content: '<p class="text-muted-foreground mb-4">Reader Premium is an optional subscription that enhances your FictionForge experience. It\'s not required to read — all public stories are always free. Premium adds quality-of-life features that make avid readers\' lives better.</p>',
          },
          {
            title: 'Premium Benefits',
            content: '<p class="text-muted-foreground mb-4">Premium subscribers enjoy:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Ad-free reading</strong> — No interruptions, ever.</li><li><strong class="text-foreground">Advanced reading stats</strong> — Track your reading history, streaks, and words read.</li><li><strong class="text-foreground">Custom themes</strong> — Access to additional reading themes and color options.</li><li><strong class="text-foreground">Premium badge</strong> — Show your support with a badge on your profile and comments.</li><li><strong class="text-foreground">Early access to features</strong> — Be the first to try new FictionForge features.</li></ul>',
          },
          {
            title: 'How to Subscribe',
            content: '<p class="text-muted-foreground mb-4">To subscribe to Reader Premium, go to your account settings and click "Upgrade to Premium." Choose between monthly or annual billing (annual saves you 20%), enter your payment details, and you\'re all set.</p><p class="text-muted-foreground mb-4">Payment is processed securely through Stripe. You can cancel anytime — your premium benefits continue until the end of your billing period.</p>',
            screenshotPlaceholder: 'The premium subscription page showing plan options and pricing'
          },
          {
            title: 'Managing Your Subscription',
            content: '<p class="text-muted-foreground mb-4">Manage your subscription from Account Settings → Subscription. From here you can:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>View your current plan and renewal date</li><li>Switch between monthly and annual billing</li><li>Update your payment method</li><li>Cancel your subscription</li><li>View your billing history and download invoices</li></ul>',
          }
        ]
      },
      {
        slug: 'install-app',
        category: 'readers',
        title: 'Install as App',
        description: 'Install FictionForge as a PWA on iOS Safari, Android Chrome, and desktop browsers.',
        icon: 'Smartphone',
        readTime: '3 min read',
        sections: [
          {
            title: 'What is a PWA?',
            content: '<p class="text-muted-foreground mb-4">FictionForge is a Progressive Web App (PWA), which means you can install it on your device just like a native app — but without downloading anything from an app store. It launches from your home screen, works offline for cached content, and sends push notifications for new chapters.</p>',
          },
          {
            title: 'Install on iOS (Safari)',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Open FictionForge in Safari (it must be Safari — other iOS browsers don\'t support PWA install)</li><li>Tap the Share button (the square with an arrow pointing up) in the bottom toolbar</li><li>Scroll down and tap "Add to Home Screen"</li><li>Give it a name (or keep the default) and tap "Add"</li></ol><p class="text-muted-foreground mb-4">The FictionForge icon will appear on your home screen. Tap it to launch the app in full-screen mode with no browser chrome.</p>',
            screenshotPlaceholder: 'iOS Safari share menu highlighting the Add to Home Screen option'
          },
          {
            title: 'Install on Android (Chrome)',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Open FictionForge in Chrome</li><li>Tap the three-dot menu in the top right</li><li>Tap "Add to Home screen" or "Install app"</li><li>Confirm the installation</li></ol><p class="text-muted-foreground mb-4">On some Android devices, you may also see an install banner at the bottom of the screen automatically. Just tap "Install" when it appears.</p>',
            screenshotPlaceholder: 'Android Chrome menu showing the Install app option'
          },
          {
            title: 'Install on Desktop',
            content: '<p class="text-muted-foreground mb-4">On desktop Chrome or Edge, look for the install icon in the address bar (it looks like a monitor with a download arrow). Click it and confirm to install FictionForge as a desktop app.</p><p class="text-muted-foreground mb-4">The desktop app opens in its own window, separate from your browser. It\'s great for distraction-free reading sessions.</p>',
            screenshotPlaceholder: 'Desktop browser address bar showing the PWA install icon'
          }
        ]
      }
    ]
  },
  {
    slug: 'migration',
    title: 'Migration Guides',
    description: 'Step-by-step guides for moving your stories from other platforms to FictionForge.',
    icon: 'ArrowRightLeft',
    guides: [
      {
        slug: 'from-royal-road',
        category: 'migration',
        title: 'Moving from Royal Road',
        description: 'Export your Royal Road stories as EPUB and import them into FictionForge.',
        icon: 'Crown',
        readTime: '6 min read',
        sections: [
          {
            title: 'Overview',
            content: '<p class="text-muted-foreground mb-4">Royal Road is one of the most popular web fiction platforms, and many authors choose to cross-post or migrate their stories to FictionForge for its modern features and monetization options. The good news: if you have Author Premium on Royal Road, you can export your story as an EPUB file, which makes migration straightforward.</p>',
          },
          {
            title: 'Exporting from Royal Road',
            content: '<p class="text-muted-foreground mb-4">Royal Road offers EPUB export for authors with Author Premium:</p><ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Log in to Royal Road and go to your Author Dashboard</li><li>Navigate to the story you want to export</li><li>Look for the "Download" or "Export" option in your story settings</li><li>Select EPUB format and download the file</li></ol><div class="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">⚠️ Note:</strong> EPUB export requires Royal Road Author Premium. If you don\'t have it, you can use the paste tool instead — see the "Alternative: Using the Paste Tool" section below.</p></div>',
            screenshotPlaceholder: 'Royal Road author dashboard showing the export/download option'
          },
          {
            title: 'Importing into FictionForge',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Create a new story on FictionForge with your title, description, genres, and cover</li><li>Go to Chapters → Import</li><li>Select "EPUB" and upload the file you downloaded from Royal Road</li><li>FictionForge will detect all chapters and show a preview</li><li>Review the chapter titles — Royal Road EPUBs usually preserve these well</li><li>Click "Import All" to create all chapters as drafts</li><li>Review each chapter for formatting issues and publish when ready</li></ol>',
            screenshotPlaceholder: 'FictionForge EPUB import with chapters detected from a Royal Road export'
          },
          {
            title: 'Alternative: Using the Paste Tool',
            content: '<p class="text-muted-foreground mb-4">If you don\'t have Royal Road Author Premium, you can still migrate using the paste tool. It\'s more manual but works perfectly well:</p><ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Open each chapter on Royal Road</li><li>Select all the chapter content (Ctrl+A in the reading area)</li><li>Copy it (Ctrl+C)</li><li>In FictionForge, go to Chapters → Import → Paste</li><li>Paste the content and import</li><li>Repeat for each chapter</li></ol><p class="text-muted-foreground mb-4">For stories with many chapters, consider doing this in batches over a few sessions. The paste tool preserves basic formatting like bold, italic, and paragraphs.</p>',
          },
          {
            title: 'Tips for a Smooth Migration',
            content: '<div class="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">🎉 Tip:</strong> Consider cross-posting rather than fully migrating. Many authors publish on both Royal Road and FictionForge to reach the widest audience.</p></div><p class="text-muted-foreground mb-4">After importing, take time to:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Review formatting on a few chapters to catch any issues</li><li>Re-upload your cover image at high resolution</li><li>Update your story description — you may want to tailor it for the FictionForge audience</li><li>Announce the migration to your Royal Road readers so they know where to find you</li></ul>',
          }
        ]
      },
      {
        slug: 'from-wattpad',
        category: 'migration',
        title: 'Moving from Wattpad',
        description: 'Migrate from Wattpad using the copy-paste workflow and multi-chapter paste tool.',
        icon: 'FileText',
        readTime: '6 min read',
        sections: [
          {
            title: 'The Wattpad Situation',
            content: '<p class="text-muted-foreground mb-4">We know it\'s frustrating — Wattpad doesn\'t offer any official way to export your stories. There\'s no download button, no EPUB export, no API access for authors who want to take their own work elsewhere. Your stories are your creative property, and you deserve to be able to move them.</p><p class="text-muted-foreground mb-4">While there\'s no one-click solution, FictionForge\'s paste tool makes the process as painless as possible.</p>',
          },
          {
            title: 'Step-by-Step Migration',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Create your story on FictionForge with title, description, cover, and genre</li><li>Open your story on Wattpad in a browser (desktop works best)</li><li>Navigate to the first chapter</li><li>Select all the chapter text (click at the start, Shift+click at the end, or Ctrl+A)</li><li>Copy with Ctrl+C</li><li>In FictionForge, go to Chapters → Import → Paste</li><li>Paste the content</li><li>Set the chapter title</li><li>Import as draft</li><li>Repeat for each chapter</li></ol><div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">💡 Tip:</strong> You can paste multiple chapters at once! Separate them with a clear marker like "---" and the paste tool will split them into individual chapters.</p></div>',
            screenshotPlaceholder: 'The paste import tool with multiple chapters separated by markers'
          },
          {
            title: 'Handling Formatting',
            content: '<p class="text-muted-foreground mb-4">Wattpad\'s formatting is relatively simple, so most content pastes cleanly. However, watch out for:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Inline images</strong> — These won\'t copy via paste. You\'ll need to download and re-upload them.</li><li><strong class="text-foreground">Custom fonts</strong> — Wattpad allows inline font changes that don\'t transfer. The text will paste in your default font.</li><li><strong class="text-foreground">Alignment</strong> — Centered text may not preserve. Check and fix any centered poetry or special formatting.</li></ul>',
          },
          {
            title: 'After Migration',
            content: '<p class="text-muted-foreground mb-4">Once all your chapters are imported, take some time to polish:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Spot-check formatting across several chapters</li><li>Re-add any images that didn\'t transfer</li><li>Update your Wattpad profile with a link to your FictionForge page</li><li>Post an announcement on Wattpad directing readers to your new home</li></ul><p class="text-muted-foreground mb-4">Many authors keep their Wattpad story up as a "sample" (first few chapters) with a note pointing to FictionForge for the full experience.</p>',
          }
        ]
      },
      {
        slug: 'from-scribble-hub',
        category: 'migration',
        title: 'Moving from Scribble Hub',
        description: 'Migrate your Scribble Hub stories to FictionForge using the paste tool.',
        icon: 'FileText',
        readTime: '5 min read',
        sections: [
          {
            title: 'Overview',
            content: '<p class="text-muted-foreground mb-4">Scribble Hub is a popular platform especially for translated novels and niche web fiction. Unfortunately, like Wattpad, Scribble Hub doesn\'t offer an official export feature for your stories. But don\'t worry — the migration process is manageable with FictionForge\'s import tools.</p>',
          },
          {
            title: 'Migration Steps',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Create your story on FictionForge</li><li>Open your Scribble Hub story and navigate to a chapter</li><li>Select and copy the chapter content from the reading page</li><li>Use FictionForge\'s Chapters → Import → Paste tool</li><li>Paste the content and set the chapter title</li><li>Import as a draft</li><li>Repeat for remaining chapters</li></ol><p class="text-muted-foreground mb-4">Scribble Hub chapters tend to copy cleanly since the platform uses straightforward HTML formatting.</p>',
            screenshotPlaceholder: 'Copying chapter content from a Scribble Hub story page'
          },
          {
            title: 'Formatting Considerations',
            content: '<p class="text-muted-foreground mb-4">Scribble Hub content generally pastes well, but keep an eye out for:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Author notes</strong> — These may copy along with the chapter. Remove them from the main content and use FictionForge\'s built-in author notes feature instead.</li><li><strong class="text-foreground">Horizontal rules</strong> — Scene breaks usually transfer, but double-check.</li><li><strong class="text-foreground">Special characters</strong> — Unicode characters and emoji should transfer fine.</li></ul>',
          },
          {
            title: 'Tips',
            content: '<div class="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">🎉 Tip:</strong> If you have a lot of chapters, consider doing the migration in batches — 10-20 chapters per session. This makes it less tedious and lets you catch formatting issues early.</p></div><p class="text-muted-foreground mb-4">Consider cross-posting to both platforms while you build your FictionForge audience. There\'s no rule against publishing in multiple places!</p>',
          }
        ]
      },
      {
        slug: 'from-ao3',
        category: 'migration',
        title: 'Moving from AO3',
        description: 'Download your AO3 work as EPUB and import it into FictionForge — the easiest migration.',
        icon: 'Download',
        readTime: '4 min read',
        sections: [
          {
            title: 'Why AO3 is the Easiest',
            content: '<p class="text-muted-foreground mb-4">Archive of Our Own (AO3) is wonderfully author-friendly when it comes to data portability. Every work on AO3 has a built-in download button that lets anyone — author or reader — download the story in multiple formats, including EPUB. This makes migrating from AO3 to FictionForge the simplest process of any platform.</p>',
          },
          {
            title: 'Downloading from AO3',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Navigate to your work on AO3</li><li>Click the "Download" button (top right of the work)</li><li>Select "EPUB" from the format options</li><li>Save the file to your computer</li></ol><p class="text-muted-foreground mb-4">That\'s it — no premium required, no hoops to jump through. AO3 respects your right to your own creative work.</p>',
            screenshotPlaceholder: 'AO3 download button showing EPUB option'
          },
          {
            title: 'Importing into FictionForge',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Create a new story on FictionForge with your details</li><li>Go to Chapters → Import → EPUB</li><li>Upload the EPUB file from AO3</li><li>Review the detected chapters</li><li>Import all chapters as drafts</li><li>Review formatting and publish</li></ol><p class="text-muted-foreground mb-4">AO3 EPUBs are well-structured, so chapter detection is highly reliable. Formatting like bold, italic, and links transfer cleanly.</p>',
            screenshotPlaceholder: 'FictionForge import preview showing chapters from an AO3 EPUB'
          },
          {
            title: 'AO3-Specific Considerations',
            content: '<p class="text-muted-foreground mb-4">A few things to keep in mind when migrating from AO3:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Tags</strong> — AO3\'s detailed tagging system doesn\'t map 1:1 to FictionForge genres and tags. Choose the most relevant ones.</li><li><strong class="text-foreground">Content warnings</strong> — Re-add appropriate content warnings on FictionForge using our content warning system.</li><li><strong class="text-foreground">Author notes</strong> — These are included in AO3 EPUBs. You may want to move them to FictionForge\'s dedicated author notes feature.</li></ul>',
          }
        ]
      },
      {
        slug: 'from-google-docs',
        category: 'migration',
        title: 'Moving from Google Docs',
        description: 'Export from Google Docs as DOCX and import into FictionForge.',
        icon: 'FileText',
        readTime: '4 min read',
        sections: [
          {
            title: 'Overview',
            content: '<p class="text-muted-foreground mb-4">Many authors draft their stories in Google Docs before publishing on a platform. If your story lives in Google Docs, moving to FictionForge is straightforward — just export as DOCX and import.</p>',
          },
          {
            title: 'Exporting from Google Docs',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Open your story in Google Docs</li><li>Go to File → Download → Microsoft Word (.docx)</li><li>Save the file to your computer</li></ol><p class="text-muted-foreground mb-4">If your story spans multiple Google Docs documents, you\'ll need to export each one separately. Alternatively, you can combine them into a single document first.</p>',
            screenshotPlaceholder: 'Google Docs File menu showing the Download as DOCX option'
          },
          {
            title: 'Preparing Your Document',
            content: '<p class="text-muted-foreground mb-4">For the best import experience, make sure your Google Doc uses proper heading styles for chapter titles:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Use <strong class="text-foreground">Heading 1</strong> or <strong class="text-foreground">Heading 2</strong> for chapter titles (e.g., "Chapter 1: The Beginning")</li><li>Use normal paragraph text for the chapter body</li><li>This allows FictionForge to automatically detect chapter boundaries</li></ul><div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">💡 Tip:</strong> If your doc doesn\'t use heading styles, add them before exporting. Select your chapter titles, then choose Heading 1 from the style dropdown. This 5-minute step saves a lot of manual splitting later.</p></div>',
          },
          {
            title: 'Importing the DOCX',
            content: '<ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Create your story on FictionForge</li><li>Go to Chapters → Import → DOCX</li><li>Upload the exported .docx file</li><li>Review the detected chapters — adjust splits if needed</li><li>Import as drafts</li><li>Review and publish</li></ol><p class="text-muted-foreground mb-4">Google Docs formatting transfers well through DOCX. Bold, italic, links, and images all come through. Tables may need minor adjustments.</p>',
            screenshotPlaceholder: 'FictionForge DOCX import showing chapters detected from heading styles'
          }
        ]
      }
    ]
  },
  {
    slug: 'community',
    title: 'Community',
    description: 'Guidelines for commenting, content standards, and reporting on FictionForge.',
    icon: 'Users',
    guides: [
      {
        slug: 'commenting',
        category: 'community',
        title: 'Commenting & Discussion',
        description: 'Etiquette, inline comments, and how to leave constructive feedback for authors.',
        icon: 'MessageSquare',
        readTime: '4 min read',
        sections: [
          {
            title: 'Comment Etiquette',
            content: '<p class="text-muted-foreground mb-4">Comments are the lifeblood of web fiction communities. A thoughtful comment can make an author\'s day and build real connections between writers and readers. Here are some guidelines for great commenting:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Be respectful</strong> — Even if a chapter isn\'t your favorite, there\'s a human on the other end who worked hard on it.</li><li><strong class="text-foreground">Be specific</strong> — "Great chapter!" is nice, but "I loved how you handled the tension in the confrontation scene" is much more meaningful.</li><li><strong class="text-foreground">Avoid spoilers</strong> — Use spoiler tags when discussing plot points from future chapters.</li><li><strong class="text-foreground">Constructive criticism</strong> — If you spot an issue, frame it helpfully. "I noticed a typo in paragraph 3" is useful. "Your writing sucks" is not.</li></ul>',
          },
          {
            title: 'Inline Comments',
            content: '<p class="text-muted-foreground mb-4">FictionForge supports inline comments — you can highlight specific text in a chapter and leave a comment attached to that exact passage. This is incredibly useful for:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Pointing out typos or grammar issues precisely</li><li>Reacting to specific moments in the story</li><li>Starting discussions about particular plot points</li></ul><p class="text-muted-foreground mb-4">To leave an inline comment, select the text you want to comment on and click the comment icon that appears. Type your comment and submit. Other readers and the author can reply to create a threaded discussion.</p>',
            screenshotPlaceholder: 'An inline comment being left on a highlighted passage of text'
          },
          {
            title: 'Discussion Tips',
            content: '<p class="text-muted-foreground mb-4">The best web fiction communities are built on genuine engagement. Here are some ways to be a valuable community member:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Speculate about the story</strong> — Authors love seeing readers theorize about where the plot is heading.</li><li><strong class="text-foreground">Mention favorite characters</strong> — Let the author know which characters resonate with you.</li><li><strong class="text-foreground">Ask questions</strong> — Genuine questions about the world or characters show deep engagement.</li><li><strong class="text-foreground">Thank the author</strong> — A simple "thanks for the chapter" goes a long way, especially for newer authors.</li></ul>',
          }
        ]
      },
      {
        slug: 'content-guidelines',
        category: 'community',
        title: 'Content Guidelines',
        description: 'What\'s allowed on FictionForge, rating system, and content warning requirements.',
        icon: 'Shield',
        readTime: '5 min read',
        sections: [
          {
            title: 'General Principles',
            content: '<p class="text-muted-foreground mb-4">FictionForge welcomes a wide range of creative fiction. We believe in giving authors freedom to tell their stories while ensuring readers can make informed choices about what they read. Our guidelines balance creative expression with community safety.</p>',
          },
          {
            title: 'Content Ratings',
            content: '<p class="text-muted-foreground mb-4">Every story on FictionForge must have an appropriate content rating:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Everyone</strong> — Suitable for all ages. No violence beyond mild cartoon-level, no sexual content, no strong language.</li><li><strong class="text-foreground">Teen</strong> — Mild violence, mild language, romantic themes. Think PG-13.</li><li><strong class="text-foreground">Mature</strong> — Significant violence, strong language, sexual themes (but not explicit). Think R-rated.</li><li><strong class="text-foreground">Adult</strong> — Explicit content. Restricted to verified adult accounts. Must use content warnings.</li></ul>',
          },
          {
            title: 'Content Warnings',
            content: '<p class="text-muted-foreground mb-4">Content warnings are required for any story that contains potentially triggering material. Authors must tag their stories and individual chapters when they contain:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Graphic violence or gore</li><li>Sexual content</li><li>Self-harm or suicide</li><li>Abuse (physical, emotional, sexual)</li><li>Drug or alcohol abuse</li><li>Hate speech (when portrayed in fiction, not endorsed)</li></ul><p class="text-muted-foreground mb-4">Content warnings help readers make informed choices. They\'re not censorship — they\'re respect for your audience.</p>',
          },
          {
            title: 'What\'s Not Allowed',
            content: '<p class="text-muted-foreground mb-4">The following content is prohibited on FictionForge regardless of rating or warnings:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Content that sexualizes minors in any way</li><li>Real-person hate fiction targeting actual individuals</li><li>Content that promotes or glorifies terrorism or extremism</li><li>Plagiarized work (copying someone else\'s story)</li><li>AI-generated content presented as human-written without disclosure</li></ul><div class="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg my-4"><p class="text-sm text-muted-foreground"><strong class="text-foreground">⚠️ Warning:</strong> Violating these guidelines may result in content removal and account suspension. For edge cases, contact our moderation team for guidance before publishing.</p></div>',
          }
        ]
      },
      {
        slug: 'reporting',
        category: 'community',
        title: 'Reporting Issues',
        description: 'How to report content violations, harassment, or technical issues on FictionForge.',
        icon: 'Flag',
        readTime: '3 min read',
        sections: [
          {
            title: 'When to Report',
            content: '<p class="text-muted-foreground mb-4">If you encounter content or behavior that violates FictionForge\'s guidelines, please report it. You should report:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li>Stories or chapters with incorrect content ratings</li><li>Content that violates our prohibited content rules</li><li>Harassment in comments</li><li>Spam or promotional content</li><li>Plagiarized stories</li><li>Impersonation of other authors</li></ul>',
          },
          {
            title: 'How to Report',
            content: '<p class="text-muted-foreground mb-4">Reporting is easy and anonymous — the reported user won\'t know who filed the report.</p><ol class="list-decimal list-inside text-muted-foreground mb-4 space-y-2"><li>Click the three-dot menu (⋯) on any story, chapter, or comment</li><li>Select "Report"</li><li>Choose the reason that best fits the issue</li><li>Add any additional context in the description field</li><li>Submit the report</li></ol><p class="text-muted-foreground mb-4">For issues that don\'t fit neatly into a report category (like DMCA claims or complex harassment situations), you can submit a support ticket from your account settings.</p>',
            screenshotPlaceholder: 'The report dialog showing reason options and description field'
          },
          {
            title: 'What Happens After',
            content: '<p class="text-muted-foreground mb-4">Our moderation team reviews every report, typically within 24-48 hours. Here\'s what to expect:</p><ul class="list-disc list-inside text-muted-foreground mb-4 space-y-2"><li><strong class="text-foreground">Review</strong> — A moderator evaluates the reported content against our guidelines</li><li><strong class="text-foreground">Action</strong> — If the report is valid, appropriate action is taken (warning, content removal, or account suspension depending on severity)</li><li><strong class="text-foreground">Notification</strong> — You\'ll receive a notification that your report was reviewed, though we can\'t share specific actions taken for privacy reasons</li></ul><p class="text-muted-foreground mb-4">False reports or weaponizing the report system against authors you disagree with is itself a violation of our community guidelines.</p>',
          }
        ]
      }
    ]
  }
]

// Helper functions
export function getAllGuides(): Guide[] {
  return guideCategories.flatMap(cat => cat.guides)
}

export function getCategory(slug: string): GuideCategory | undefined {
  return guideCategories.find(cat => cat.slug === slug)
}

export function getGuide(categorySlug: string, guideSlug: string): Guide | undefined {
  const category = getCategory(categorySlug)
  return category?.guides.find(g => g.slug === guideSlug)
}

export function getAdjacentGuides(categorySlug: string, guideSlug: string): { prev: Guide | null; next: Guide | null } {
  const category = getCategory(categorySlug)
  if (!category) return { prev: null, next: null }
  const idx = category.guides.findIndex(g => g.slug === guideSlug)
  return {
    prev: idx > 0 ? category.guides[idx - 1] : null,
    next: idx < category.guides.length - 1 ? category.guides[idx + 1] : null,
  }
}

export const popularGuideSlugs = [
  { category: 'authors', slug: 'getting-started' },
  { category: 'readers', slug: 'reading-experience' },
  { category: 'migration', slug: 'from-royal-road' },
  { category: 'authors', slug: 'monetization' },
  { category: 'readers', slug: 'install-app' },
  { category: 'migration', slug: 'from-ao3' },
]
