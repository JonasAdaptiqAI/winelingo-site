// Copy for the comparison pages and the FAQ (scripts/build-compare.mjs).
// {{table:winelingo,vivino}} becomes a comparison table generated from the fact files, and
// {{app:vivino:price.paid}} is replaced by that fact, so the copy never restates a price by hand.
// Rules: plain words, no knocking other apps, say where another app is the better choice.

const faq = {
  path: "/faq/",
  type: "faq",
  title: "Winelingo FAQ: What It Is, What It Costs, How It Works",
  desc: "Plain answers about Winelingo: what the app does, what is free, what Premium costs, which phones it works on, the languages, and who makes it.",
  eyebrow: "Questions and answers",
  crumb: "FAQ",
  h1: "Winelingo: the short answers",
  deck: "What it is, what it costs, where it works and who makes it. Written to be quoted.",
  body: `
<h2>Winelingo in one paragraph</h2>
<p><strong>Winelingo is a wine-education app for iPhone, with the same course in any web browser.</strong> It teaches wine in short, interactive lessons (178 lessons in 27 units), has games and free practice tests, and scans a wine label or a restaurant wine list and explains the wine in plain words. It is free to download; Premium costs $3.99 a month, or the course can be bought once for $39.99. Winelingo does not sell wine and shows no ads. It is made by Jonas Egeskov in Denmark and has been on the App Store since August 2026.</p>

<h2>The facts at a glance</h2>
<div class="table-wrap cmp"><table class="data"><tbody>
<tr><td>What it is</td><td>A wine-education app: lessons, games, practice tests and a scanner that explains the wine</td></tr>
<tr><td>Who it is for</td><td>Beginners and curious drinkers, people studying for a first wine exam, and restaurant staff</td></tr>
<tr><td>Works on</td><td>iPhone (iOS 16.4 or later). The course and the tests also run in any browser, including on Android and computers</td></tr>
<tr><td>Free</td><td>Every lesson in the iPhone app with 5 hearts that refill, 5 label scans a month, the first two course units on the web, and 13 practice tests</td></tr>
<tr><td>Premium</td><td>$3.99 a month: unlimited hearts, unlimited label and wine-list scans, the whole course on the web</td></tr>
<tr><td>Course for life</td><td>$39.99 once on winelingo.app, no subscription (scans not included)</td></tr>
<tr><td>Languages</td><td>The app: English, Danish, German, Spanish, French, Italian, Portuguese (European and Brazilian), Dutch, Swedish, Norwegian, Finnish and Polish. The web course: English, Danish, Spanish and German</td></tr>
<tr><td>For restaurants</td><td>Staff training with one team code and a staff test built on the venue's own wine list</td></tr>
<tr><td>Made by</td><td>Jonas Egeskov, Egeskov Engineering, Denmark. Independent: not owned by a wine shop or retailer</td></tr>
<tr><td>Age</td><td>For adults of legal drinking age (18+)</td></tr>
</tbody></table></div>
<p>Prices are US prices; the App Store and the web checkout show the price in your currency. Full details are on the <a href="/pricing/">pricing page</a>.</p>

<h2>What Winelingo is not</h2>
<ul>
<li><strong>Not a wine shop.</strong> It does not sell wine or take a cut when you buy a bottle.</li>
<li><strong>Not a ratings database.</strong> You rate wines for yourself, to map your own palate. A wine shows an average Winelingo rating only once at least three people have rated it, and there are no public reviews.</li>
<li><strong>Not a cellar manager.</strong> It keeps a tasting journal, not an inventory of bottles.</li>
<li><strong>Not a qualification.</strong> It prepares you for a WSET or sommelier course, but it does not replace one or give a certificate.</li>
</ul>
<p>If one of those is what you need, see <a href="/compare/">how Winelingo compares with other wine apps</a>, including when another app is the better choice.</p>
`,
  faqs: [
    { q: "What is Winelingo?", a: "Winelingo is a wine-education app for iPhone, with the same course in any web browser. It teaches wine in short, interactive lessons, has games and free practice tests, and scans a wine label or a restaurant wine list and explains the wine in plain words." },
    { q: "Is Winelingo free?", a: "Yes, it is free to download and free to start. In the iPhone app every lesson is open, with five hearts that refill over time, and you get five label scans a month. On the web the first two course units are free, and so are all the practice tests. Premium ($3.99 a month) removes the limits." },
    { q: "How much does Winelingo Premium cost?", a: "Premium is $3.99 a month and you can cancel at any time; in the iPhone app there is also an annual plan, $29.99 a year on the US App Store. It gives unlimited hearts, unlimited label and wine-list scans in the iPhone app, and the whole course on the web. There is also a one-off option, bought on winelingo.app: the course for life for $39.99, with no subscription (scans are not included). The App Store and the web checkout show the price in your currency." },
    { q: "Is there a Winelingo app for Android?", a: "No, not yet. The app is for iPhone. On an Android phone or a computer you can take the whole course and all the practice tests in your browser at winelingo.app/course, with the same account. Scanning labels and wine lists needs the iPhone app." },
    { q: "How is Winelingo different from Vivino?", a: "They do different jobs. Vivino is built around crowd ratings, reviews and buying wine. Winelingo is built around learning: lessons, games and a scanner that explains why a wine tastes the way it does. Winelingo does not sell wine and has no public reviews. Many people could use both. See the full, sourced comparison at winelingo.app/compare/winelingo-vs-vivino." },
    { q: "Does Winelingo sell wine or show ads?", a: "No. Winelingo does not sell wine, takes no commission on bottles and shows no ads. It earns money from Premium, the course and team plans for restaurants." },
    { q: "Which languages does Winelingo support?", a: "The iPhone app is available in English, Danish, German, Spanish, French, Italian, Portuguese (European and Brazilian), Dutch, Swedish, Norwegian, Finnish and Polish. The web course is in English, Danish, Spanish and German." },
    { q: "Can Winelingo help me prepare for WSET or a sommelier exam?", a: "It can help you prepare, but it is not an official course. Winelingo has free, unofficial practice tests in the style of WSET Level 1, 2 and 3 and the Court of Master Sommeliers Introductory exam, including a 50-question Level 2 mock exam with a timed exam mode. Winelingo is not affiliated with WSET or the Court of Master Sommeliers." },
    { q: "Can restaurants use Winelingo to train staff?", a: "Yes. A restaurant, wine bar or hotel gets one team code that gives the whole team Premium, and Winelingo builds a staff test from the venue's own wine list. Staff learn on their own phones, a few minutes at a time. Details are at winelingo.app/business." },
    { q: "Who makes Winelingo?", a: "Winelingo is made by Jonas Egeskov (Egeskov Engineering) in Denmark. It is an independent app, launched on the App Store in August 2026." },
    { q: "Is my data private?", a: "Your palate profile is private, and so is your tasting journal unless you choose to share a tasting with friends you have accepted. Your star ratings are also counted anonymously in a wine's average rating, which never shows who rated. Scanned photos are processed to return your result and are not used for advertising, and Winelingo does not sell personal data. You can delete your account and its data inside the app. The details are in the privacy policy at winelingo.app/privacy." },
  ],
};


const C = [["Compare wine apps", "/compare/"]];

const hub = {
  path: "/compare/",
  title: "Wine Apps Compared: Which One for Which Job | Winelingo",
  desc: "An honest guide to wine apps: which one to use to learn wine, rate a bottle, find a price, run a cellar or study for an exam. Sourced and dated.",
  eyebrow: "Compare wine apps",
  crumb: "Compare wine apps",
  h1: "Wine apps compared: which one for which job",
  deck: "Wine apps do different jobs. Pick by what you want to do, not by which one is biggest.",
  body: `
<h2>Start with the job</h2>
<p>Most "best wine app" lists compare apps that are not trying to do the same thing. One helps you buy, one runs a cellar, one teaches. So the useful question is what you want the app for.</p>
<ul class="cmp-list">
<li><h3>I want to learn about wine</h3><p><strong>Winelingo</strong> (short lessons, games and a scanner that explains the bottle) or <strong>Wine Master</strong> (a free course with 460+ lessons). <a href="/compare/best-apps-to-learn-wine/">Seventeen apps to learn wine, compared</a>.</p></li>
<li><h3>I want to know if this bottle is any good</h3><p><strong>Vivino</strong>: crowd ratings for millions of wines. <a href="/compare/winelingo-vs-vivino/">Winelingo vs Vivino</a> · <a href="/compare/vivino-alternatives/">Vivino alternatives</a> · <a href="/compare/vivino-vs-delectable/">Vivino vs Delectable</a>.</p></li>
<li><h3>I want to find a bottle and a fair price</h3><p><strong>Wine-Searcher</strong>: prices from tens of thousands of merchants.</p></li>
<li><h3>I want to manage a cellar</h3><p><strong>CellarTracker</strong>: inventory, values and drinking windows.</p></li>
<li><h3>I am studying for WSET or a sommelier exam</h3><p><strong>Cork Dork</strong> for flashcards, <strong>Wine Master</strong> or <a href="/tests/">Winelingo's free practice tests</a> for mock exams. <a href="/compare/free-wset-practice-tests/">Free WSET practice tests compared</a>.</p></li>
<li><h3>I run a restaurant and want to train my staff</h3><p>Quiz tools built on your own wine list, wine courses for servers and the WSET route: <a href="/compare/wine-training-for-restaurant-staff/">wine training for restaurant staff, compared</a>.</p></li>
</ul>
<p><strong>Not sure what you like yet?</strong> Take the free <a href="/tests/wine-palate-quiz/">wine palate quiz</a> first: eight questions about coffee, chocolate and lemons, no wine knowledge needed, and you get a white and a red style to try.</p>
<p>The full list, with prices and what each app does and does not do: <a href="/compare/best-wine-apps/">the best wine apps, by what you want to do</a>.</p>

<h2>All the comparisons</h2>
<ul>
<li><a href="/compare/best-wine-apps/">The best wine apps in 2026, by what you want to do</a></li>
<li><a href="/compare/best-apps-to-learn-wine/">The best apps to learn about wine</a></li>
<li><a href="/compare/free-wset-practice-tests/">Free WSET practice tests and mock exams</a></li>
<li><a href="/compare/wine-training-for-restaurant-staff/">Wine training for restaurant staff</a></li>
<li><a href="/compare/winelingo-vs-vivino/">Winelingo vs Vivino</a></li>
<li><a href="/compare/vivino-alternatives/">Vivino alternatives</a></li>
<li><a href="/compare/vivino-vs-delectable/">Vivino vs Delectable</a></li>
<li><a href="/compare/winelingo-alternatives/">Winelingo alternatives</a>: when another app is the better choice</li>
</ul>

<h2>How we keep these pages honest</h2>
<ul>
<li>Facts about another app come from its own App Store or Google Play listing, its own website or Apple's public data. The one exception is who owns Delectable, which comes from news reports of the 2016 sale. Each comparison table links its sources.</li>
<li>In the tables, a dash for another app means its listing does not describe that feature. It does not prove the feature is missing.</li>
<li>Every page shows the date the facts were last checked. Apps change; if a page is out of date, <a href="mailto:jonsegeskov29@gmail.com?subject=Correction%20to%20a%20comparison%20page">tell us</a>.</li>
<li>We did not install and test every app. We compare what each company says its app does.</li>
<li>Where another app is the better choice, the page says so.</li>
</ul>
`,
  faqs: [
    { q: "What is the best wine app?", a: "It depends on the job. To learn about wine: Winelingo or Wine Master. For a crowd rating on a bottle: Vivino. To find where to buy a bottle and compare prices: Wine-Searcher. To manage a cellar: CellarTracker. For exam flashcards: Cork Dork." },
    { q: "Is there an app like Duolingo for wine?", a: "Yes, a few. Winelingo teaches wine in short daily lessons with streaks, hearts and a weekly league, and also scans labels and wine lists. Wine Master is a free course of more than 460 short lessons. True Wine and Decanter Know Your Wine also teach in short sessions." },
  ],
};

const best = {
  path: "/compare/best-wine-apps/",
  crumbs: C,
  title: "The Best Wine Apps in 2026, by What You Want to Do | Winelingo",
  desc: "The best wine apps in 2026 for learning, rating a bottle, finding prices, managing a cellar and exam prep. What each does, what it costs, sourced and dated.",
  eyebrow: "Wine apps",
  crumb: "Best wine apps",
  h1: "The best wine apps in 2026, by what you want to do",
  deck: "Eleven wine apps and Winelingo, sorted by the job they do, with prices and the date each fact was checked.",
  body: `
<h2>The short version</h2>
<div class="table-wrap cmp"><table class="data"><thead><tr><th scope="col">If you want to</th><th scope="col">Use</th><th scope="col">Why</th></tr></thead><tbody>
<tr><td>Learn wine from scratch</td><td>Winelingo or Wine Master</td><td>Step-by-step lessons. Winelingo adds a scanner that explains the bottle; Wine Master is free</td></tr>
<tr><td>Get a rating for a bottle</td><td>Vivino</td><td>{{app:vivino:short.scale}}</td></tr>
<tr><td>Find a bottle and compare prices</td><td>Wine-Searcher</td><td>{{app:wine-searcher:short.scale}}</td></tr>
<tr><td>Manage a cellar</td><td>CellarTracker</td><td>Inventory, values and drinking windows</td></tr>
<tr><td>Keep a photo journal</td><td>Delectable or Vivino</td><td>Both save what you drink; Delectable's iPhone app has not been updated since 2021</td></tr>
<tr><td>Study for WSET or CMS exams</td><td>Cork Dork, Wine Master, Winelingo's free tests</td><td>Flashcards, mock exams and practice questions</td></tr>
<tr><td>Study wine maps</td><td>Wine Folly Plus</td><td>Zoomable maps and infographics</td></tr>
</tbody></table></div>

<h2 id="learn">Apps that teach you wine</h2>
<p>These apps are built to teach. They differ in how: Winelingo and Wine Master are step-by-step courses, Decanter Know Your Wine drills facts with repeated questions, True Wine uses short game-style lessons, and SomeWine combines a short course with scanning and a cellar.</p>
{{table:winelingo,wine-master,somewine,decanter-know-your-wine,true-wine}}
<ul class="cmp-list">
<li><h3>Winelingo</h3><p class="cmp-meta">iPhone, and the course in any browser · free, Premium $3.99 a month</p><p>Short lessons, games and practice tests, plus a scanner that explains a label or a wine list in plain words. It is our app. It is new and small: no Android app, very few ratings from other users, and a much smaller wine database than Vivino.</p></li>
<li><h3>Wine Master: Learn Wine</h3><p class="cmp-meta">iPhone, Android, Web · free</p><p>The listing describes 28 "islands" and more than 460 short lessons in 14 languages, with WSET Level 1 to 3 practice, and says it is free with no ads or in-app purchases. Since November 2026 its listing also describes a label scan that reads the words on a label; it says the scan does not look the wine up in a database. First released in September 2026.</p></li>
<li><h3>SomeWine</h3><p class="cmp-meta">iPhone · free, Pro $4.99 a month</p><p>A new app (July 2026) that puts a 32-lesson course, label scanning, a cellar and food pairing in one place. The free plan has 10 label scans in total and a 3-bottle cellar; wine-list scanning needs Pro.</p></li>
<li><h3>Decanter Know Your Wine</h3><p class="cmp-meta">iPhone · over 10 free modules, then $19.99 a year or $0.99 a module</p><p>Made by Feed Your Elephant with the wine magazine Decanter. It teaches with modules of questions and spaced repetition, so it suits memorising facts. The iPhone app was last updated in September 2024.</p></li>
<li><h3>True Wine</h3><p class="cmp-meta">iPhone · free, Premium $9.99 a month or $59.99 a year</p><p>Game-style lessons and a map of wine regions. The app was last updated in March 2025.</p></li>
</ul>

<p>There are more learning apps than these five. <a href="/compare/best-apps-to-learn-wine/">The best apps to learn about wine</a> compares seventeen, including Sommo, Sommy, Duo Vino and VINYO. WSET's own app, WSET Tasting Notes, is a tasting-note tool, not a course.</p>

<h2>Apps for the bottle in front of you</h2>
<p>These are the apps most people mean by "wine app": point the camera at a label and get an answer. They answer different questions, though. Vivino answers "is it good?", Wine-Searcher answers "what should it cost?", CellarTracker answers "what do I own?".</p>
{{table:vivino,wine-searcher,cellartracker,delectable}}
<ul class="cmp-list">
<li><h3>Vivino</h3><p class="cmp-meta">iPhone, Android, Web · free, Premium from $4.99</p><p>The biggest, by its own figures. Scan a label for a crowd rating, reviews, tasting notes and food pairings, and buy from partner merchants in the app. Its listing describes no lessons or quizzes. Vivino lists the restaurant wine-list scanner as a <a href="https://www.vivino.com/en/premium" rel="nofollow noopener">Premium benefit</a>.</p></li>
<li><h3>Wine-Searcher</h3><p class="cmp-meta">iPhone, Android, Web · free, PRO paid</p><p>A price-comparison engine. It finds which merchants stock a wine and at what price, then sends you to the merchant to buy.</p></li>
<li><h3>CellarTracker</h3><p class="cmp-meta">iPhone, Android, Web · free tier, $40 to $500 a year by cellar size</p><p>The collector's tool: inventory, community tasting notes, values and drinking windows. Prices, valuation and the AI features need a subscription. Its help pages list wine-list scanning <a href="https://support.cellartracker.com/category/72-beta" rel="nofollow noopener">under Beta</a>.</p></li>
<li><h3>Delectable</h3><p class="cmp-meta">iPhone, Android, Web · free with ads, Premium $5.99 a month</p><p>A photo journal with a feed of what wine professionals drink; it is owned by the wine publication Vinous. Check before you rely on it: the iPhone app was last updated in September 2021.</p></li>
</ul>

<h2>Apps for exam study</h2>
<ul class="cmp-list">
<li><h3>Cork Dork Wine Study</h3><p class="cmp-meta">iPhone, Android · six study categories free, Pro from $7.99 a month</p><p>Flashcards, map quizzes and practice questions aimed at WSET Level 2 and 3 and the Court of Master Sommeliers Introductory and Certified exams. Source: its <a href="https://apps.apple.com/us/app/cork-dork-wine-study/id1564201450" rel="nofollow noopener">App Store listing</a>.</p></li>
<li><h3>Wine Folly Plus</h3><p class="cmp-meta">iPhone, Android, Web · starts free, the full collection $99.99 (its website says $99 a year)</p><p>Zoomable maps and infographics from Wine Folly. Reference material more than a course: Wine Folly's courses are sold separately. Source: its <a href="https://apps.apple.com/us/app/wine-folly-plus/id6763405098" rel="nofollow noopener">App Store listing</a> and <a href="https://winefolly.com/plus" rel="nofollow noopener">winefolly.com/plus</a>.</p></li>
<li><h3>Winelingo's practice tests</h3><p class="cmp-meta">Any browser · free</p><p>Unofficial practice for WSET Level 1 to 3 and the Introductory Sommelier exam, including <a href="/tests/wset-level-2-mock-exam/">a timed 50-question Level 2 mock exam</a>. No app needed.</p></li>
</ul>
<p>Cork Dork and Winelingo both state that they are not affiliated with WSET or the Court of Master Sommeliers. No app replaces the course itself. For a wider list, see <a href="/compare/free-wset-practice-tests/">free WSET practice tests and mock exams compared</a>.</p>

<h2>One older app to know about</h2>
<p><strong>Hello Vino</strong> still appears on many lists. It suggests wine for a dish or an occasion and is free, but its iPhone app was last updated in September 2017, according to its <a href="https://apps.apple.com/us/app/hello-vino-wine-assistant/id318447346" rel="nofollow noopener">App Store listing</a>.</p>

<h2>How to choose</h2>
<p>You do not have to pick one. A common pairing is a ratings app for the shop shelf and a learning app for the rest of the week: the first tells you what other people thought, the second teaches you why you like what you like, so you need the first one less over time.</p>
`,
  faqs: [
    { q: "What is the best wine app in 2026?", a: "There is no single best one, because wine apps do different jobs. Vivino is the largest for ratings and buying. Wine-Searcher is the one for prices. CellarTracker is the one for managing a cellar. For learning wine, Winelingo and Wine Master are step-by-step courses." },
    { q: "What is the best app to learn about wine?", a: "Winelingo and Wine Master both teach wine step by step in short lessons. Winelingo adds games, a scanner that explains the bottle or wine list in front of you, and free WSET-style practice tests; it is free to start, with Premium at $3.99 a month. Wine Master's listing says it is free with no in-app purchases and has more than 460 lessons; its label scan reads the words on a label and does not look the wine up in a database." },
    { q: "Which wine apps are free?", a: "Most are free to download with a paid tier. Wine Master's listing says it is entirely free, and Hello Vino lists no in-app purchases. Vivino, Wine-Searcher, CellarTracker, Delectable, SomeWine and Winelingo all have a free tier and a paid one." },
    { q: "Which wine app scans restaurant wine lists?", a: "Vivino (listed as a Premium benefit), CellarTracker (listed under Beta in its help pages), SomeWine (Pro) and Winelingo (Premium) all describe wine-list scanning. All four describe pointing you to the bottles on the list that suit your own taste." },
  ],
};

const vsVivino = {
  path: "/compare/winelingo-vs-vivino/",
  crumbs: C,
  title: "Winelingo vs Vivino: Which Wine App Should You Use? | Winelingo",
  desc: "Winelingo vs Vivino, compared honestly: Vivino rates and sells wine, Winelingo teaches it. Features, prices and who each app suits, with sources.",
  eyebrow: "Comparison",
  crumb: "Winelingo vs Vivino",
  h1: "Winelingo vs Vivino",
  deck: "Vivino tells you what other people thought of a wine. Winelingo teaches you to understand it yourself. Many people will want both.",
  body: `
<h2>The short answer</h2>
<p><strong>Choose Vivino</strong> if you want a crowd rating and reviews for the bottle in front of you, or want to buy wine in the app. It is far bigger: {{app:vivino:short.scale}}.</p>
<p><strong>Choose Winelingo</strong> if you want to learn: why a wine tastes the way it does, how to read a label or a wine list, and what you like. It has lessons, games and practice tests, and it does not sell wine.</p>

<h2>Side by side</h2>
{{table:winelingo,vivino}}

<div class="cmp-pick">
<div><h3>Where Vivino is the better choice</h3><ul>
<li>You want to know what thousands of other drinkers thought of a bottle</li>
<li>You want to order wine from the app</li>
<li>You have an Android phone and want a native app</li>
<li>You want a cellar list as well as a journal</li>
<li>You scan rare or unusual bottles: Vivino's database is far larger</li>
</ul></div>
<div><h3>Where Winelingo is the better choice</h3><ul>
<li>You want to learn wine step by step, a few minutes a day</li>
<li>You want the scan to explain the wine in plain words, not give a score</li>
<li>You want an app with no shop and no ads</li>
<li>You are preparing for a first wine course or exam</li>
<li>You train restaurant staff</li>
</ul></div>
</div>

<h2>What each app does with a scan</h2>
<p>Both apps scan a label. Vivino shows a community rating, reviews, tasting notes, food pairings and where to buy the wine, and its listing describes a taste profile built from your ratings with a "Match for You" score. Winelingo shows a taste profile (body, tannin, acidity, sweetness), explains why the wine tastes that way from its grapes and region, suggests food, and offers a short lesson linked to the bottle.</p>
<p>Both also scan restaurant wine lists, in their paid tiers. Vivino lists its wine-list scanner as a <a href="https://www.vivino.com/en/premium" rel="nofollow noopener">Premium benefit</a>: it shows the star rating for every wine on the list, and the App Store listing says it helps you spot the best bottles for your taste. Winelingo's list scan, also in Premium, points to the bottles that match the palate you have built from your own ratings.</p>

<h2>Learning</h2>
<p>This is the real difference. Vivino's App Store listing describes no lessons, courses or quizzes; it describes an app that helps you "discover, choose, and buy the right wine". Winelingo is a course: 178 lessons in 27 units, games, and <a href="/tests/">free practice tests</a>.</p>

<h2>Price</h2>
<p>Both are free to download. Vivino Premium is sold in the app; the US App Store lists Premium purchases from $4.99. Winelingo Premium is $3.99 a month, or the course alone is $39.99 once. See <a href="/pricing/">Winelingo's prices</a>.</p>

<h2>Can you use both?</h2>
<p>Yes, and it is a sensible pairing: Vivino at the shop shelf for a quick second opinion, Winelingo for learning what the labels mean so that you need the second opinion less.</p>
`,
  faqs: [
    { q: "Is Winelingo better than Vivino?", a: "Not better, different. Vivino is the stronger choice for crowd ratings, reviews and buying wine, and it has a far larger wine database and an Android app. Winelingo is the stronger choice for learning about wine: it has lessons, games and practice tests, which Vivino's listing does not describe." },
    { q: "Is Vivino free?", a: "Vivino is free to download, and its App Store listing describes label scanning, ratings and reviews, a journal and a cellar without marking them as paid. Vivino Premium is a paid tier; Vivino lists the restaurant wine-list scanner among its benefits. The US App Store lists Premium purchases from $4.99." },
    { q: "Does Vivino teach you about wine?", a: "Vivino's App Store listing does not describe lessons, courses or quizzes. It gives ratings, reviews, tasting notes from other users and food pairings for each wine. To learn wine step by step, use a learning app such as Winelingo or Wine Master." },
    { q: "Does Winelingo have ratings like Vivino?", a: "Not in the same way. In Winelingo you rate wines for yourself, and the app uses your ratings to map your palate. A wine shows an average Winelingo rating once at least three people have rated it, but there are no public reviews, and far fewer ratings than Vivino has." },
  ],
};

const vivinoAlts = {
  path: "/compare/vivino-alternatives/",
  crumbs: C,
  title: "Vivino Alternatives: 6 Apps, Sorted by What You Want Instead | Winelingo",
  desc: "Looking for a Vivino alternative? Six wine apps sorted by what you want instead: learning, prices, a cellar, a journal or wine-list help. Sourced and dated.",
  eyebrow: "Alternatives",
  crumb: "Vivino alternatives",
  h1: "Vivino alternatives, sorted by what you want instead",
  deck: "The right alternative depends on why you are looking. Here are six, each for a different reason.",
  body: `
<h2>First: what do you want that Vivino does not give you?</h2>
<p>Vivino is the largest wine app by its own figures ({{app:vivino:short.scale}}), and no other app here states a database that size. Here are six reasons people look for an alternative. Find yours.</p>
<ul class="cmp-list">
<li><h3>"I want to learn about wine, not just see a score"</h3><p><strong>Winelingo</strong> or <strong>Wine Master</strong>. Winelingo teaches in short lessons and games, and its scanner explains why a wine tastes the way it does; free to start, Premium $3.99 a month, iPhone plus any browser. Wine Master is a free course of more than 460 lessons on iPhone, Android and the web; its <a href="https://apps.apple.com/us/app/wine-master-learn-wine/id6812080826" rel="nofollow noopener">iPhone listing</a> says its label scan reads the words on a label and does not look the wine up in a database.</p></li>
<li><h3>"I mostly want prices and where to buy"</h3><p><strong>Wine-Searcher</strong>. It compares prices across merchants and sends you to the merchant's own site to buy.</p></li>
<li><h3>"I want a proper cellar"</h3><p><strong>CellarTracker</strong>. Built for collectors: inventory, community tasting notes, values and drinking windows. The free tier tracks your bottles; a subscription ($40 to $500 a year by cellar size) adds prices and valuation.</p></li>
<li><h3>"I want a journal of what I drink"</h3><p><strong>Delectable</strong> keeps a photo journal and shows what wine professionals drink. Note that its iPhone app was last updated in September 2021. <a href="/compare/vivino-vs-delectable/">Vivino vs Delectable</a>.</p></li>
<li><h3>"I want an app that does not sell wine"</h3><p><strong>Winelingo</strong> does not sell wine, and the listings for <strong>CellarTracker</strong> and <strong>Wine Master</strong> describe no wine sales; CellarTracker shows merchant prices from Wine-Searcher. Wine-Searcher does not sell wine itself either; it links to merchants.</p></li>
<li><h3>"I want scanning, a cellar and lessons in one app"</h3><p><strong>SomeWine</strong>, a new iPhone app (July 2026). The free plan is limited to 10 label scans in total and a 3-bottle cellar; Pro is $4.99 a month (<a href="https://somewine.app/pricing" rel="nofollow noopener">somewine.app/pricing</a>).</p></li>
</ul>

<h2>Side by side</h2>
{{table:vivino,winelingo,wine-searcher,cellartracker,delectable}}

<h2>When to stay with Vivino</h2>
<p>If what you want is a rating for an unfamiliar bottle in a shop, stay. Of the alternatives here, CellarTracker also has a large body of community ratings (it states over 13.6 million ratings and reviews), Delectable and Wine-Searcher have user ratings too, and Winelingo has very few. You can also keep Vivino and add a second app for the thing it does not do.</p>
`,
  faqs: [
    { q: "What is the best alternative to Vivino?", a: "It depends on what you want instead. For learning about wine: Winelingo or Wine Master. For prices and where to buy: Wine-Searcher. For managing a cellar: CellarTracker. For a photo journal: Delectable, although its iPhone app was last updated in 2021." },
    { q: "Is there an app like Vivino that does not sell wine?", a: "Yes. Winelingo does not sell wine, and the listings for CellarTracker and Wine Master describe no wine sales. Wine-Searcher compares merchant prices and links to the merchant but does not sell wine itself. None of them states a community as large as Vivino's." },
    { q: "Is there a free alternative to Vivino?", a: "Vivino itself is free to download, and its listing describes scanning and ratings without marking them as paid. Of the alternatives, Wine-Searcher, CellarTracker, Delectable and Winelingo all have free tiers, and Wine Master's listing says it is entirely free." },
  ],
};

const vivinoDelectable = {
  path: "/compare/vivino-vs-delectable/",
  crumbs: C,
  title: "Vivino vs Delectable (2026): Which Wine App Is Better? | Winelingo",
  desc: "Vivino vs Delectable in 2026: features, prices, and one fact that matters. Delectable's iPhone app was last updated in 2021. Sourced and dated.",
  eyebrow: "Comparison",
  crumb: "Vivino vs Delectable",
  h1: "Vivino vs Delectable",
  deck: "Two label-scanning apps with different ideas: Vivino is crowd ratings and a shop, Delectable is a journal and a feed of wine professionals.",
  body: `
<h2>The short answer</h2>
<p><strong>For most people in 2026, Vivino.</strong> It is actively updated (its iPhone app was updated in November 2026), has a far larger community, and has a cellar, food pairings and, in Premium, a wine-list scanner.</p>
<p><strong>Delectable</strong>'s strengths are its feed of sommeliers, winemakers and critics, unlimited free label scans, and Vinous reviews in its Premium tier. But its iPhone app was last updated on 14 September 2021 and its <a href="https://play.google.com/store/apps/details?id=com.delectable.mobile" rel="nofollow noopener">Android app</a> in April 2024, so check that it works well on your phone before you move your notes into it.</p>
<p>Winelingo is neither of these: it is a learning app, and we make it. We have tried to write this page the way we would want a comparison of our own app written.</p>

<h2>Side by side</h2>
{{table:vivino,delectable}}

<h2>Ratings</h2>
<p>Vivino shows a community rating out of five and written reviews for each wine. Delectable shows community ratings too, and adds Vinous critic reviews for Premium subscribers ($5.99 a month). If you trust critics more than crowds, that is Delectable's strongest point.</p>

<h2>Buying wine</h2>
<p>Vivino sells wine in the app through partner merchants; availability depends on your country. Delectable's listing also describes buying wine from your phone, but that listing dates from 2021, so we could not confirm it still works.</p>

<h2>Journal and cellar</h2>
<p>Both keep a record of what you scan. Vivino also has a cellar list. Delectable's listing describes no cellar tracking.</p>

<h2>Price</h2>
<p>Both are free to use. Vivino Premium is sold in the app from $4.99. Delectable's free version shows ads; removing them costs $1.99 a month, and Premium is $5.99 a month.</p>

<h2>If you want to learn rather than rate</h2>
<p>Neither app is built to teach: neither listing describes lessons or quizzes. For that, see <a href="/compare/best-wine-apps/#learn">the apps that teach you wine</a>.</p>
`,
  faqs: [
    { q: "Is Vivino or Delectable better?", a: "For most people Vivino, because it is actively updated and has a much larger community, a cellar and food pairings. Delectable's strengths are its feed of wine professionals and the Vinous critic reviews in its Premium tier, but its iPhone app was last updated in September 2021." },
    { q: "Is Delectable still updated?", a: "Delectable's iPhone app was last updated on 14 September 2021 and its Android app on 15 April 2024, according to the App Store and Google Play. The website delectable.com is still online and is owned by Vinous." },
    { q: "Who owns Delectable?", a: "Delectable is owned by the wine publication Vinous. Vinous founder Antonio Galloni acquired it in December 2016, as reported by App Developer Magazine at the time, and delectable.com carries a Vinous Group copyright notice." },
  ],
};

const ourAlts = {
  path: "/compare/winelingo-alternatives/",
  crumbs: C,
  title: "Winelingo Alternatives: When Another Wine App Fits Better | Winelingo",
  desc: "Winelingo alternatives, written by Winelingo: when Wine Master, Vivino, CellarTracker, Cork Dork or SomeWine is the better choice, and when it is not.",
  eyebrow: "Alternatives",
  crumb: "Winelingo alternatives",
  h1: "Winelingo alternatives",
  deck: "Winelingo is not the right app for everyone. Here is when another one fits better, written by the people who make it.",
  body: `
<h2>When another app is the better choice</h2>
<ul class="cmp-list">
<li><h3>You want a course that is completely free</h3><p><strong>Wine Master: Learn Wine.</strong> Its listing says it is free with no ads or in-app purchases, with more than 460 short lessons in 14 languages and WSET Level 1 to 3 practice. In Winelingo's iPhone app every lesson is open too, but with hearts that run out when you make mistakes; unlimited hearts are part of Premium.</p></li>
<li><h3>You have an Android phone and want an app</h3><p><strong>Wine Master</strong>, <strong>Cork Dork</strong> or <strong>Vivino</strong>. Winelingo has no Android app. Its course and tests run in a browser on Android, but scanning needs an iPhone.</p></li>
<li><h3>You want ratings and prices for a bottle</h3><p><strong>Vivino</strong> for crowd ratings, <strong>Wine-Searcher</strong> for prices. Winelingo has very few ratings from other users, no public reviews and no prices. <a href="/compare/winelingo-vs-vivino/">Winelingo vs Vivino</a>.</p></li>
<li><h3>You want to manage a cellar</h3><p><strong>CellarTracker.</strong> Winelingo keeps a tasting journal, not an inventory.</p></li>
<li><h3>You want exam flashcards</h3><p><strong>Cork Dork Wine Study.</strong> It is built around flashcards and map quizzes for WSET Level 2 and 3 and the Court of Master Sommeliers Introductory and Certified exams. Winelingo has <a href="/tests/">free practice tests</a>, but no flashcard decks.</p></li>
<li><h3>You want detailed wine maps</h3><p><strong>Wine Folly Plus.</strong> Zoomable maps and infographics. It starts free; the full collection is $99.99 a year (<a href="https://apps.apple.com/us/app/wine-folly-plus/id6763405098" rel="nofollow noopener">App Store listing</a>).</p></li>
<li><h3>You want scanning, lessons and a cellar in one app</h3><p><strong>SomeWine.</strong> A new iPhone app with a 32-lesson course, a scanner and a cellar. Its free plan allows 10 label scans in total; Winelingo's allows 5 a month.</p></li>
</ul>

<h2>Learning apps side by side</h2>
{{table:winelingo,wine-master,somewine,decanter-know-your-wine,cork-dork}}

<h2>When Winelingo is the right choice</h2>
<ul>
<li>You want to learn wine in short daily lessons and also understand the bottle or the wine list in front of you, in one app.</li>
<li>You want the scan to explain the wine (body, tannin, acidity, sweetness and why), and to pick bottles from a wine list that match your own palate.</li>
<li>You run a restaurant or wine bar and want your team trained on your own wine list. See <a href="/business/">Winelingo for restaurants</a>.</li>
<li>You want an app with no wine shop and no ads.</li>
</ul>

<h2>What to know before you choose Winelingo</h2>
<ul>
<li>It is new (August 2026) and made by one independent developer.</li>
<li>There is no Android app.</li>
<li>Its wine database is small next to apps that have collected labels for more than a decade, so a scan of a rare bottle can miss.</li>
<li>Free lessons use hearts; free scans are limited to 5 a month. <a href="/pricing/">Prices</a>.</li>
</ul>
`,
  faqs: [
    { q: "What are the best alternatives to Winelingo?", a: "For a completely free wine course: Wine Master. For crowd ratings: Vivino. For prices: Wine-Searcher. For managing a cellar: CellarTracker. For exam flashcards: Cork Dork. For scanning, lessons and a cellar in one iPhone app: SomeWine." },
    { q: "Is there a free alternative to Winelingo?", a: "Wine Master's App Store listing says it is free with no ads or in-app purchases, and it has more than 460 lessons. Winelingo itself is free to start: every lesson is open in the iPhone app, with hearts that refill over time, and the first two course units and all practice tests are free on the web." },
    { q: "Is there a Winelingo alternative for Android?", a: "Yes. Wine Master and Cork Dork have Android apps for learning, and Vivino, Wine-Searcher and CellarTracker have Android apps for ratings, prices and cellars. Winelingo's course and tests also run in the browser on Android." },
  ],
};


// ---- Pages added 2026-11-16: the questions people put to AI assistants that the pages above
// do not answer (exam practice, staff training). Facts: wset-practice.json, staff-training.json.
const D16 = "2026-11-16";

const wsetPractice = {
  path: "/compare/free-wset-practice-tests/",
  crumbs: C,
  checked: D16,
  things: "resources",
  title: "Free WSET Practice Tests and Mock Exams Compared (2026) | Winelingo",
  desc: "Where to find WSET Level 1, 2 and 3 practice questions and mock exams, free and paid: what each offers, what needs an account, and the real exam formats.",
  eyebrow: "Exam practice",
  crumb: "WSET practice tests",
  h1: "Free WSET practice tests and mock exams, compared",
  deck: "Fourteen places to practise for WSET Level 1 to 3 and the Introductory Sommelier exam: what is free, what needs an account and what costs money.",
  body: `
<h2>The short version</h2>
<div class="table-wrap cmp"><table class="data"><thead><tr><th scope="col">If you want</th><th scope="col">Look at</th><th scope="col">Why</th></tr></thead><tbody>
<tr><td>A free mock exam right now, no account</td><td>portnwine, Sommo, Wine Exam Trainer, Winelingo</td><td>Each opens a mock in the browser with no sign-up shown. Wine Exam Trainer's free mock is one per level, for Level 2 and 3</td></tr>
<tr><td>The largest free question bank we found</td><td>Wine Master: Learn Wine</td><td>Its listing says more than 4,700 questions, free, with timed mocks (iPhone, Android and web)</td></tr>
<tr><td>Many different mock papers for Level 2 or 3</td><td>Wine Exam Trainer, WineRevision</td><td>Wine Exam Trainer is a paid bank of 3,516 questions; WineRevision is free with an account</td></tr>
<tr><td>Practice for the Level 3 written questions</td><td>Sommo, ThirtyFifty, Wine Exam Trainer</td><td>Typed answers marked by AI (Sommo's paid plan, Wine Exam Trainer), or short-written mock exams from a WSET course provider (ThirtyFifty)</td></tr>
<tr><td>Flashcards more than tests</td><td>Brainscape, Cork Dork</td><td>Spaced-repetition cards for Level 2 and 3</td></tr>
<tr><td>Official sample questions</td><td>WSET's own specification PDFs</td><td>Five sample questions per level, with an answer key</td></tr>
</tbody></table></div>
<p>Every resource here except WSET's own documents is unofficial. WSET states in each specification that it does not release past papers, so no site has the real questions.</p>

<h2 id="format">What the real exams look like</h2>
<p>Before you pick a practice test, check that it matches the exam you will sit.</p>
{{examformat}}
<p>WSET's own web pages show different exam times in places; the figures above follow the specification PDFs.</p>
<p>At Level 1 and Level 2 the exam is multiple choice only, one mark per question, and nothing is subtracted for a wrong answer. Level 3 is different: besides 50 multiple-choice questions there are four short-written questions and a blind tasting of two wines, and you need 55% in each part. A multiple-choice mock prepares you for only one of those three parts.</p>

<h2 id="free">Free, in a browser, without an account</h2>
{{wset:winelingo-tests,sommo,portnwine,eclavin,open-exam-prep,wset-official-specifications}}
<ul class="cmp-list">
<li><h3>Winelingo practice tests</h3><p class="cmp-meta">Website · free · no account</p><p>Ours. A <a href="/tests/wset-level-2-mock-exam/">50-question Level 2 mock exam</a>, plus shorter sets for <a href="/tests/wset-level-1-practice/">Level 1</a> (10 questions), <a href="/tests/wset-level-3-practice/">Level 3</a> (30 multiple-choice questions) and the <a href="/tests/introductory-sommelier-practice/">Introductory Sommelier exam</a> (30 questions). Each has a timed exam mode and a practice mode that explains every answer. The limit: each exam has one fixed set of questions, so the second attempt shows the same ones. For more variety, use one of the larger banks below.</p></li>
<li><h3>Sommo</h3><p class="cmp-meta">Website, iPhone, Android · web mocks free · no account</p><p>Free browser mock tests for WSET Level 1, 2 and 3 with unlimited retakes, and a 70-question Introductory Sommelier practice exam drawn from a bank of 162. The Level 1 mock draws 50 questions from a bank of 180. Sommo's own page says its quiz is "not an official paper or a complete exam simulation". In the app, Levels 2 to 4 need the paid plan ($4.99 a month or $29.99 a year in the US), which also adds typed answers marked by AI.</p></li>
<li><h3>portnwine</h3><p class="cmp-meta">Website · free · no sign-up shown</p><p>Timed mock papers for Level 1 (30 questions in 45 minutes), Level 2 (50 in 60 minutes) and Level 3 (50 multiple-choice questions), drawn at random on each attempt, with a written explanation for every question at the end. The site does not say how large its question bank is or who writes the questions.</p></li>
<li><h3>Eclavin</h3><p class="cmp-meta">Website, iPhone · web questions free · no account</p><p>100 free questions each for Level 1 and Level 2 on the web, every one with a worked explanation. Level 3 is in the iPhone app only, behind a $17.99 unlock.</p></li>
<li><h3>OpenExamPrep</h3><p class="cmp-meta">Website · free · no registration</p><p>A general exam-prep site with 100 practice questions and explanations for Level 2 and 100 for Level 3. The site says its questions are "independently developed simulations" and that coverage and difficulty "may differ from the actual exam".</p></li>
<li><h3>WSET's own specifications</h3><p class="cmp-meta">PDF · free · official</p><p>The specification for each level has the exam format and five sample multiple-choice questions with an answer key; the Level 3 document adds one sample written question without a model answer. It is a small set, but these are the only official questions WSET publishes openly, as far as we found, and the document also lists every learning outcome you can be asked about.</p></li>
</ul>

<h2 id="account">Free, with an account or in an app</h2>
{{wset:winerevision,wine-master-learn-wine,thirtyfifty}}
<ul class="cmp-list">
<li><h3>WineRevision</h3><p class="cmp-meta">Website · free · account needed for the full mocks</p><p>The site says it has, for Level 2, more than 450 flashcards and 6 mock exams (300 questions) and, for Level 3, more than 1,150 flashcards and 10 mock exams (500 questions). The counters on its homepage show much smaller numbers, and we could not check behind the login. A 10-question Level 2 sample is open without an account. The site does not name who runs it.</p></li>
<li><h3>Wine Master: Learn Wine</h3><p class="cmp-meta">iPhone, Android, Web · free</p><p>Its App Store listing describes practice for WSET Levels 1 to 3 "with more than 4,700 questions and a written explanation for every answer", including timed mock exams, and says the app is free with no ads or in-app purchases. The app is new (first released in September 2026).</p></li>
<li><h3>ThirtyFifty</h3><p class="cmp-meta">Website · Level 1 free with an account · Level 2 £15 · Level 3 mocks £30</p><p>Written by a WSET course provider in London. Two free Level 1 mock exams of 30 questions; five Level 2 mock exams of 50 questions for £15; for Level 3, ten multiple-choice mocks and four short-written exams. Free to ThirtyFifty's own students.</p></li>
</ul>

<h2 id="paid">Paid question banks and flashcards</h2>
{{wset:wine-exam-trainer,brainscape,cork-dork-wine-study,wine-trainer-wset-sommelier,udemy-wset-practice-tests}}
<ul class="cmp-list">
<li><h3>Wine Exam Trainer</h3><p class="cmp-meta">Website · €9 a month or €30 for six months · one free mock per level</p><p>A bank of 3,516 exam-format questions for Level 2, Level 3 and the Diploma, including 612 open questions for Level 3 that are marked by AI. One timed mock per level and 25 sample questions are free without an account.</p></li>
<li><h3>Brainscape</h3><p class="cmp-meta">Website, iPhone, Android · free to start, Pro about $8 a month when billed yearly</p><p>Flashcard classes for Level 2, Level 3 and the Introductory Sommelier exam, written by named authors. These are question-and-answer cards, not exam-format papers.</p></li>
<li><h3>Cork Dork Wine Study</h3><p class="cmp-meta">iPhone, Android · six categories free, Pro from $7.99 a month</p><p>About 2,500 flashcards (per its App Store listing), wine maps and map quizzes for WSET Level 2 and 3 and the Court of Master Sommeliers Introductory and Certified exams. Its listing does not describe an exam-format mock test.</p></li>
<li><h3>Wine Trainer: WSET &amp; Sommelier</h3><p class="cmp-meta">iPhone, Android · 48-hour free trial, then one-time purchases</p><p>More than 4,700 quiz questions sold as one-time purchases, with no subscription. The listing mentions WSET and sommelier study in general but names no level or syllabus.</p></li>
<li><h3>Udemy practice-test courses</h3><p class="cmp-meta">Website · about €20 to €35 per course at list price, often much less in a sale</p><p>Sets of practice tests for Levels 1 to 3, each written by a different instructor. Several have few or no ratings, so judge them one by one. Prices were read on Udemy's euro storefront.</p></li>
</ul>

<h2 id="level3">If you are sitting Level 3</h2>
<p>Most free resources, including ours, practise only the multiple-choice part of Level 3. The written part needs its own 55% and a different kind of practice: explaining why a wine tastes the way it does, in full sentences, from the vineyard to the glass. Of the resources here, Wine Exam Trainer (open questions marked by AI), Sommo (typed answers marked by AI, on its paid plan) and ThirtyFifty (short-written mock exams) describe practice for that part. Your course provider is the first place to ask for feedback on written answers.</p>

<h2 id="cms">For the Introductory Sommelier exam</h2>
<p>The Court of Master Sommeliers Americas describes the Introductory exam as 70 multiple-choice questions in 45 minutes with a 60% pass mark. Sommo has a free 70-question practice exam, <a href="/tests/introductory-sommelier-practice/">Winelingo has 30 free questions</a>, and Cork Dork and Brainscape have flashcards for it.</p>

<h2>How to use a mock exam</h2>
<ol>
<li><strong>Read the specification first.</strong> It lists what can be asked. A practice test that covers something else is wasting your time.</li>
<li><strong>Sit one full mock against the clock early,</strong> to see the format and find your weak topics.</li>
<li><strong>Study the weak topics, then use a different set of questions.</strong> Repeating the same paper measures your memory of that paper.</li>
<li><strong>Answer every question.</strong> Nothing is subtracted for a wrong answer at Level 1 or Level 2.</li>
</ol>
<p>No practice test replaces the course. To earn the qualification you must sit the exam through an approved WSET course provider.</p>
`,
  faqs: [
    { q: "Where can I find free WSET Level 2 practice questions?", a: "Several sites offer them without payment. Sommo, portnwine and Winelingo each have a free 50-question Level 2 mock exam that opens in a browser with no sign-up shown. Eclavin and OpenExamPrep each have 100 free Level 2 questions with explanations. WineRevision says it has six Level 2 mock exams, free with an account. WSET's own Level 2 specification has five official sample questions." },
    { q: "Does WSET publish past exam papers?", a: "No. Each WSET specification states that WSET does not release past papers. The specifications for Level 1, 2 and 3 each include five sample multiple-choice questions with an answer key, and the Level 3 specification adds one sample written question. Every other practice test is unofficial." },
    { q: "How many questions are in the WSET Level 2 exam?", a: "The WSET Level 2 Award in Wines exam is 50 multiple-choice questions in 60 minutes, closed book. The pass mark is 55%; 70% is a pass with merit and 85% a pass with distinction. Each question is worth one mark and nothing is subtracted for a wrong answer. Source: the WSET Level 2 specification." },
    { q: "What is the WSET Level 1 exam format?", a: "The WSET Level 1 Award in Wines exam is 30 multiple-choice questions in 45 minutes, closed book, with a pass mark of 70%, according to the WSET Level 1 specification." },
    { q: "Are free WSET mock exams enough to pass Level 3?", a: "Not on their own. The Level 3 exam has 50 multiple-choice questions, four short-written questions and a blind tasting of two wines, and you need 55% in each part. Most free mock exams practise only the multiple-choice part." },
    { q: "Is there a free practice test for the Introductory Sommelier exam?", a: "Yes. Sommo has a free 70-question practice exam in the browser, and Winelingo has 30 free questions with explanations. Both are unofficial and not affiliated with the Court of Master Sommeliers." },
  ],
};

const staffTraining = {
  path: "/compare/wine-training-for-restaurant-staff/",
  crumbs: C,
  checked: D16,
  things: "tools",
  title: "Wine Training for Restaurant Staff: 14 Tools and Courses Compared | Winelingo",
  desc: "Apps, quiz tools and courses for training servers in wine, compared: what each does, whether it is built on your own wine list, and what it costs.",
  eyebrow: "For restaurants",
  crumb: "Staff wine training",
  h1: "Wine training for restaurant staff: 14 tools and courses compared",
  deck: "Quiz tools built on your own wine list, wine courses for servers, staff reference tools and the WSET route, with prices where they are published.",
  body: `
<h2>Four different things are sold as "staff wine training"</h2>
<p>The tools below do not all do the same job, so start with what your team is missing.</p>
<div class="table-wrap cmp"><table class="data"><thead><tr><th scope="col">If your team needs</th><th scope="col">Look at</th><th scope="col">What you get</th></tr></thead><tbody>
<tr><td>To know <em>your</em> list by heart</td><td>Service Well, ShiftTrained, Tablo</td><td>Quizzes built from your own wine list, menu or products, with results the manager can see</td></tr>
<tr><td>To understand wine itself</td><td>Knowbie, Mitti, Typsy, Vinealto, Winelingo</td><td>A general wine course, from a 30-minute primer (Mitti) to a full course in short lessons</td></tr>
<tr><td>Your own list in the server's pocket</td><td>Lumintino, SommOne Server, Sorso, WineValueAI</td><td>Your list as a staff reference or a daily brief; none describes quizzes or tests</td></tr>
<tr><td>A recognised qualification</td><td>WSET Level 1, through a course provider</td><td>A certificate each person keeps</td></tr>
</tbody></table></div>
<p>Many teams need two of these: a course so staff can explain why a wine tastes the way it does, and a quiz on the house list so they can sell the bottles you actually pour.</p>

<h2 id="own-list">Quizzes built on your own wine list</h2>
{{staff:shifttrained,tablo,service-well,winelingo-business}}
<ul class="cmp-list">
<li><h3>ShiftTrained</h3><p class="cmp-meta">Web app by text link · from $29 a month · free trial</p><p>You upload the wine list as a PDF and AI writes the questions; staff answer on their phones from a text link with nothing to install. Every plan lists manager access, a leaderboard and score tracking. Plans go by number of employees: $29 a month for up to 20, $49 for up to 40, $99 for up to 99.</p></li>
<li><h3>Tablo</h3><p class="cmp-meta">iPhone and Android app · $49.99 a month, unlimited staff · 7-day free trial</p><p>Turns the imported menu, wine list included, into three-minute pre-shift quizzes, and shows the manager who has trained tonight and which categories are weakest. The plan covers 40 quizzes a month. It covers the whole menu, so wine is one part of it.</p></li>
<li><h3>Service Well</h3><p class="cmp-meta">Phone web app · $15 to $25 per staff member a month · waitlist</p><p>The manager enters the products by name (wine, cocktails, spirits, sake, beer, food) and staff get 60-second quizzes and flashcards. Managers see completion rates and knowledge gaps. Sign-up was by waitlist on the date we checked.</p></li>
<li><h3>Winelingo for restaurants</h3><p class="cmp-meta">iPhone app and web course · price on request · free trial period</p><p>Ours. We build one ten-question staff test from your wine list by hand, and the team also gets the full wine course and a weekly league. Where the three tools above are stronger: they build quizzes from your own list or products as often as you like (ShiftTrained rebuilds them when you upload the list again), they give the manager scores or completion data, and they publish their prices. Winelingo has no manager dashboard, and the employer cannot see anyone's account.</p></li>
</ul>

<h2 id="course">Wine courses for servers</h2>
{{staff:winelingo-business,knowbie,typsy,mitti-wine-knowledge,vinealto}}
<ul class="cmp-list">
<li><h3>Winelingo for restaurants</h3><p class="cmp-meta">iPhone app and web course · English, Danish, German, Spanish</p><p>A full wine course in lessons of about five minutes, with games, a weekly team league and a scanner that explains the bottle in front of you. It suits teams where the gap is wine knowledge itself. See <a href="/business/">Winelingo for restaurants</a> and try <a href="/tests/">the practice tests</a>: 13 are free with no account, five of them written for floor staff.</p></li>
<li><h3>Knowbie</h3><p class="cmp-meta">iPhone and Android app · price on request</p><p>A gamified app that teaches wine, beer, spirits and food pairing in short chapters with quizzes and badges. It lists a progress dashboard and pre-shift messages for managers. No prices are published.</p></li>
<li><h3>Typsy</h3><p class="cmp-meta">Video courses on web, iPhone, Android · team plan €120 per member a year</p><p>A hospitality learning platform with more than 2,000 short video lessons and tools for assigning and tracking training. Wine is a small part: we found five wine courses out of 183, including "Wine 101 for servers" (seven lessons, about 28 minutes). The price was shown in euros to a visitor in Denmark.</p></li>
<li><h3>Mitti: Wine Knowledge</h3><p class="cmp-meta">Online course · free · platform free for up to 10 seats</p><p>A free, editable course for servers in four lessons that takes under 30 minutes. A sensible first step for a small team with no budget.</p></li>
<li><h3>Vinealto</h3><p class="cmp-meta">Web course and apps · business terms on request</p><p>A British wine-education site with its own three-stage course; the Foundation stage is free. The business offer and its prices are shown only after registering.</p></li>
</ul>

<h2 id="reference">Reference tools for the floor</h2>
<p>These put your wine list in the server's pocket, with tasting notes, pairings and talking points for each bottle. None of the four describes quizzes or tests. SommOne Server calls itself a staff education program built on your list, and lets a manager see how much each server uses it; Sorso lists staff training sessions on its Enterprise plan.</p>
{{staff:my-wine-guide-sommone-server,lumintino,sorso,winevalue-ai}}

<h2 id="qualification">The qualification route</h2>
{{staff:wset-level-1-award-in-wines,napa-valley-wine-academy}}
<p>The WSET Level 1 Award in Wines is a beginner qualification with six hours of guided learning, including a multiple-choice exam, taught by independent course providers who set their own prices. One US school lists it from $289 per person. It gives each person a certificate, which matters to some staff and some venues. It does not cover your own list, and at a few hundred dollars per person it costs more than most of the tools above do in a first year, so it tends to suit key staff more than a whole seasonal team. If someone is preparing for it, there are <a href="/compare/free-wset-practice-tests/">free WSET practice tests</a>.</p>

<h2>Questions to ask before you choose</h2>
<ul>
<li><strong>Is the gap the list or the basics?</strong> A quiz on your bottles does not teach why Chablis is crisp; a course does not teach which Chablis you pour.</li>
<li><strong>Do you need to see who has done the training?</strong> If so, pick a tool with manager reporting. Winelingo does not have it.</li>
<li><strong>How often does the list change?</strong> If it changes weekly, a tool that regenerates quizzes from the list saves work.</li>
<li><strong>What phones does the team have?</strong> Check for Android as well as iPhone, or a version that runs in the browser.</li>
<li><strong>How is it priced?</strong> Per venue, per employee band or per person. A per-person price adds up quickly with seasonal staff.</li>
</ul>
<p>Two more products came up and are not compared here: WineStaff, whose site describes a private app for one restaurant group's own staff, and Oeno Academy, whose site said registration was not yet open.</p>
`,
  faqs: [
    { q: "What is the best app to train restaurant staff on wine?", a: "It depends on the gap. For quizzes built on your own wine list with results the manager can see, look at ShiftTrained (from $29 a month), Tablo ($49.99 a month) or Service Well. For teaching wine itself in short lessons on staff's own phones, Knowbie and Winelingo do that; Winelingo also builds one staff test from the venue's wine list but has no manager dashboard. Typsy covers wine as part of broad hospitality video training." },
    { q: "How much does wine training for restaurant staff cost?", a: "Published prices on 16 November 2026: ShiftTrained from $29 a month for up to 20 employees, Tablo $49.99 a month for unlimited staff, Service Well $15 to $25 per staff member a month, Typsy €120 per team member a year. Mitti's Wine Knowledge course is free. Knowbie, Lumintino, SommOne Server, Vinealto's business offer, Napa Valley Wine Academy's team courses and Winelingo give prices on request. A WSET Level 1 course costs a few hundred dollars per person, depending on the provider." },
    { q: "Can staff training be built on our own wine list?", a: "Yes. ShiftTrained and Tablo generate quizzes from the wine list or menu you upload, and Service Well from products you enter. SommOne Server, Lumintino, Sorso and WineValueAI turn your list into a reference or a daily brief for staff. Winelingo builds one ten-question staff test from your list by hand, alongside its general wine course." },
    { q: "Do servers need a WSET qualification?", a: "No, it is not required to serve wine. WSET Level 1 is a recognised beginner qualification that some venues pay for key staff to take. For a whole team, and especially for seasonal staff, a short course or quizzes on the house wine list are cheaper and quicker to start." },
    { q: "Is there free wine training for servers?", a: "Yes. Mitti by SafetyCulture has a free Wine Knowledge course for servers that takes under 30 minutes. Winelingo has 13 free practice tests in the browser with no account, five of them written for floor staff (serving wine and guest questions among them), and the first lessons of its course are free. Vinealto's Foundation course is free." },
  ],
};

const learnApps = {
  path: "/compare/best-apps-to-learn-wine/",
  crumbs: C,
  checked: D16,
  checkedFrom: "2026-11-10", // seven of the apps were checked with the first batch
  title: "The Best Apps to Learn About Wine in 2026: 17 Compared | Winelingo",
  desc: "Apps that teach wine, compared: step-by-step courses, apps that scan and teach, and drill apps for exams and blind tasting. Prices, platforms and sources.",
  eyebrow: "Learn wine",
  crumb: "Apps to learn wine",
  h1: "The best apps to learn about wine in 2026",
  deck: "Seventeen apps that teach wine, sorted by how they teach, with what is free, what it costs and which phones each one works on.",
  body: `
<h2>The short version</h2>
<div class="table-wrap cmp"><table class="data"><thead><tr><th scope="col">If you want</th><th scope="col">Look at</th><th scope="col">Why</th></tr></thead><tbody>
<tr><td>A step-by-step course in short daily lessons</td><td>For example Sommy, Wine Master, Winelingo</td><td>All three teach from the start in short lessons. Four more are in the first section below</td></tr>
<tr><td>Everything free</td><td>Wine Master</td><td>Its listing says it is free with no ads or in-app purchases, with more than 460 lessons</td></tr>
<tr><td>To learn from the bottle in front of you</td><td>SomeWine, Sommo, Sommy, Wine Master, Winelingo</td><td>Each combines lessons with a label scan. Wine Master's reads the words on the label only</td></tr>
<tr><td>An Android app</td><td>Among the course apps: Duo Vino, Sommo, VINYO, Wine Master, Winemind</td><td>Ten of the seventeen have an Android app. Winelingo's course runs in an Android browser, but it has no Android app</td></tr>
<tr><td>To study for WSET Level 2</td><td>Duo Vino, Sommo, Wine Master</td><td>Duo Vino is built around the exam. Sommo (Level 2 needs its paid plan in the app) and Wine Master (free) include Level 2 practice and mock exams. See also <a href="/compare/free-wset-practice-tests/">free WSET practice tests</a></td></tr>
<tr><td>To get better at blind tasting</td><td>Sensium</td><td>Drills on telling grapes apart</td></tr>
<tr><td>To memorise facts</td><td>Brainscape, Cork Dork, Decanter Know Your Wine, Wine Trainer</td><td>Flashcards and repeated questions</td></tr>
</tbody></table></div>
<p>There is no single best app, because these apps teach in different ways. The sections below sort them by method, since that decides whether you will keep using one.</p>

<h2 id="courses">Step-by-step courses in short lessons</h2>
<p>These are the closest thing to a language-learning app for wine: a path of short lessons with questions, meant to be done a few minutes a day.</p>
{{table:winelingo,wine-master,sommy,duo-vino}}
{{table:vinyo,winemind,true-wine,decanter-know-your-wine}}
<ul class="cmp-list">
<li><h3>Winelingo</h3><p class="cmp-meta">iPhone, and the course in any browser · free, Premium $3.99 a month</p><p>Ours. 178 lessons in 27 units, from the basics through grapes, serving and twelve wine countries, with games, streaks and a weekly league. It also scans a label or a restaurant wine list and explains the wine, and has free practice tests. Where it is weaker: there is no Android app, it is new, and few people have rated it yet.</p></li>
<li><h3>Wine Master: Learn Wine</h3><p class="cmp-meta">iPhone, Android, Web · free</p><p>The listing describes more than 460 short lessons in 14 languages, with WSET Level 1 to 3 practice, and says the app is free with no ads or in-app purchases. If price is what matters, start here. Since version 1.6.0 (November 2026) it also has a label scan that reads the words on a label; its listing says the scan does not look the wine up in a database. First released in September 2026.</p></li>
<li><h3>Sommy</h3><p class="cmp-meta">iPhone · two courses free, Premium listed at $8.99 and $49.99</p><p>You pick a goal and follow a path of short lessons and quizzes; guided tastings start from a photo of the label and are saved to a journal. Wine 101 and Bubbles 101 are free from start to finish. Some courses are sold as separate packs. First released in August 2026.</p></li>
<li><h3>Duo Vino</h3><p class="cmp-meta">iPhone, Android, Web · free daily quiz, Premium $9.99 a month or $49.99 a year</p><p>A daily-habit course built around WSET Level 2: lessons by grape and region, flashcards, mock exams with a score per topic, and guided tastings. A good fit if Level 2 is the goal; less so if you want wine in general without an exam. First released in September 2026.</p></li>
<li><h3>VINYO</h3><p class="cmp-meta">iPhone, Android · free to download</p><p>Describes itself as "the Duolingo of wine": beginner lessons with quizzes, badges and challenges, a tasting journal and a social feed. Its listing also mentions discovering and shopping for wines from "diverse winemakers and local producers"; how buying works is not described. The App Store page lists no in-app purchases, while Google Play labels the app as having some, with no prices shown.</p></li>
<li><h3>Winemind</h3><p class="cmp-meta">iPhone, Android · some courses free, $9.99 a month or $89.99 a year</p><p>Short courses on tasting, grapes, food pairing, buying and serving, with quizzes that explain the answers. Its website lists nine courses with 60 lessons in total, in six languages.</p></li>
<li><h3>True Wine</h3><p class="cmp-meta">iPhone · free, Premium $9.99 a month or $59.99 a year</p><p>Game-style lessons and a map of wine regions. The app was last updated in March 2025.</p></li>
<li><h3>Decanter Know Your Wine</h3><p class="cmp-meta">iPhone · over 10 free modules, then $19.99 a year or $0.99 a module</p><p>Made by Feed Your Elephant with the wine magazine Decanter. It teaches with repeated questions spaced over time, so it suits memorising facts more than learning from zero. The app was last updated in September 2024.</p></li>
</ul>

<h2 id="scan">Apps that scan and teach</h2>
<p>These tie the learning to real bottles: you scan a label and the app explains the wine, keeps a journal, or both.</p>
{{table:winelingo,sommo,somewine,vinoh,winebible}}
<ul class="cmp-list">
<li><h3>Sommo</h3><p class="cmp-meta">iPhone, Android, Web · free tier, Pro (called Premium on its website) $4.99 a month or $29.99 a year</p><p>The broadest of the five in this table: a label, menu and shelf scanner, a cellar, a tasting journal and WSET study from Level 1 to 4 in one app. The free tier has five scans in total and WSET Level 1 study. Where it is stronger than Winelingo: it has an Android app, a cellar and exam study up to Level 4, and more ratings (73 on the US App Store against very few for Winelingo).</p></li>
<li><h3>Winelingo</h3><p class="cmp-meta">iPhone · 5 free label scans a month</p><p>The scanner explains the wine in plain words (body, tannin, acidity, sweetness and why it tastes that way) and links it to the lessons. Wine-list scanning is part of Premium. It keeps a tasting journal but does not manage a cellar.</p></li>
<li><h3>SomeWine</h3><p class="cmp-meta">iPhone · free, Pro $4.99 a month</p><p>A 32-lesson course with label scanning, a cellar and food pairing. The free plan has 10 label scans in total and a 3-bottle cellar; wine-list scanning needs Pro.</p></li>
<li><h3>Vinoh</h3><p class="cmp-meta">iPhone · core journal free, Plus listed at $4.99 and $44.99</p><p>A wine journal first: a label photo starts an entry, and six guided "Wine Journeys" add short lessons and quizzes. English only.</p></li>
<li><h3>WineBible</h3><p class="cmp-meta">iPhone, with a web companion · free download, Pro $1.99</p><p>Lessons, quizzes, region guides and a food-pairing guide. Its App Store listing does not describe label scanning; its website mentions giving a label photo to an AI tasting coach. The app was last updated in April 2025.</p></li>
</ul>

<h2 id="drill">Drill apps: flashcards, exam questions and blind tasting</h2>
<p>These do not teach from zero. They are for practising what a course or a book has already taught you.</p>
{{table:sensium,brainscape-wine,cork-dork,wine-trainer,wine-folly-plus}}
<ul class="cmp-list">
<li><h3>Sensium</h3><p class="cmp-meta">iPhone, Android, Web · free drills, Premium $8.99 a month or $59.99 a year</p><p>A trainer for blind tasting: a path through the most-planted grapes, drills on grapes that are easy to confuse, and a grape atlas. It is the only app here built solely around identifying grapes blind.</p></li>
<li><h3>Brainscape</h3><p class="cmp-meta">iPhone, Android, Web · free to start, Pro about $8 a month when billed yearly</p><p>A general flashcard app with ready-made wine decks for WSET Level 2, WSET Level 3 and the Introductory Sommelier exam.</p></li>
<li><h3>Cork Dork Wine Study</h3><p class="cmp-meta">iPhone, Android · six categories free, Pro from $7.99 a month</p><p>Flashcards, wine maps and map quizzes aimed at WSET Level 2 and 3 and Court of Master Sommeliers students.</p></li>
<li><h3>Wine Trainer</h3><p class="cmp-meta">iPhone, Android · 48-hour free trial, then one-time purchases</p><p>More than 4,700 flashcard questions with no subscription. On the App Store since 2011.</p></li>
<li><h3>Wine Folly Plus</h3><p class="cmp-meta">iPhone, Android, Web · starts free, $99.99 for the full collection</p><p>Maps and infographics from Wine Folly: a visual reference for study, not a course.</p></li>
</ul>

<h2 id="duolingo">Is there a Duolingo for wine?</h2>
<p>Several apps borrow the idea of short daily lessons with streaks and rewards. VINYO uses the phrase itself. Duo Vino is built on a daily habit with a mascot as tutor. Winelingo has streaks, hearts and a weekly league. Wine Master organises more than 460 lessons into "islands". Sommy has you pick a goal and follow a path of short stops, with daily streaks. None of them is made by or connected with Duolingo.</p>
<p>What differs is what happens outside the lesson. Sommy, Wine Master and Winelingo connect lessons to a bottle you scan; Duo Vino is built around the WSET Level 2 exam; VINYO adds a social feed.</p>

<h2>How to choose</h2>
<ul>
<li><strong>Check your phone first.</strong> Several of these are iPhone only, Winelingo's app included.</li>
<li><strong>Decide whether an exam is the goal.</strong> If it is, pick an app built around that syllabus and add <a href="/compare/free-wset-practice-tests/">practice tests</a>. If it is not, an exam app will feel like homework.</li>
<li><strong>Try the free part first.</strong> Nearly every app here has one, though Wine Trainer's lasts 48 hours and two listings do not say what is free. The best app is the one you still open after a week.</li>
<li><strong>Look at the last update.</strong> Three apps on this page have not been updated for more than a year.</li>
</ul>
<p>Looking for ratings, prices or a cellar instead? See <a href="/compare/best-wine-apps/">the best wine apps by what you want to do</a>.</p>
`,
  faqs: [
    { q: "What is the best app to learn about wine?", a: "It depends on how you want to learn. For a step-by-step course in short daily lessons: Winelingo (iPhone and web, free to start, Premium $3.99 a month), Wine Master (iPhone, Android and web; its listing says it is entirely free) or Sommy (iPhone). To learn from the bottle in front of you: Winelingo, Sommo, SomeWine, Sommy or Wine Master, which combine lessons with a label scan. For WSET Level 2 study: Duo Vino, which is built around the exam, or Sommo and Wine Master, which include Level 2 practice. For blind tasting practice: Sensium." },
    { q: "Is there an app like Duolingo for wine?", a: "Yes, several apps teach wine in short daily lessons with streaks and rewards. Winelingo has 178 lessons with streaks, hearts and a weekly league, plus a label scanner. Wine Master has more than 460 short lessons and is free. VINYO describes itself as the Duolingo of wine. Duo Vino and Sommy also use daily lessons. None of them is connected with Duolingo." },
    { q: "Which wine learning apps are free?", a: "Wine Master's listing says it is entirely free, with no ads or in-app purchases. VINYO is free to download and its App Store page lists no purchases, though Google Play labels it as having in-app purchases. Most others have a free part and a paid part: Winelingo opens every lesson in the iPhone app for free with hearts that refill, Sommy has two full courses free, Sommo includes WSET Level 1 study, and Decanter Know Your Wine has more than ten free modules." },
    { q: "Which wine learning apps work on Android?", a: "Ten of the seventeen: Brainscape, Cork Dork, Duo Vino, Sensium, Sommo, VINYO, Wine Folly Plus, Wine Master, Wine Trainer and Winemind. Winelingo has no Android app, but its course and practice tests run in the browser on an Android phone." },
    { q: "Can an app replace a wine course like WSET?", a: "No. An app can teach you the same knowledge and help you practise, but only an approved course provider can give you a WSET qualification, and tasting with other people is hard to replace. Apps are a good way to start, to prepare before a course and to revise during one." },
  ],
};

export const pages = [faq, hub, best, vsVivino, vivinoAlts, vivinoDelectable, ourAlts, learnApps, wsetPractice, staffTraining];
