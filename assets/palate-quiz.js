/* Winelingo palate quiz — "What wine will I like?"
   Eight everyday taste questions map to the four things wine teachers taste for
   (acidity, sweetness, tannin, body) plus oak and a flavour family. Each answer moves
   those dials; the nearest white and red style profile wins. A first guess, not a verdict.
   Language: ?lang=xx, else the visitor's saved choice (wl-lang, shared with the tests), else the browser. */
(function () {
  var APP = "https://apps.apple.com/app/id6785896824";
  var LANGS = ["en", "da"];
  var NAMES = { en: "English", da: "Dansk" };

  /* ---------- Questions. v = what the answer does to the dials (0–4 scale) ---------- */
  // A acidity, S sweetness, T tannin (grip), B body, O oak, F flavour family, Z bubbles
  var Q = [
    { id: "coffee", opts: [
      { v: { T: 4, S: 0.3 } }, { v: { T: 3, S: 1 } }, { v: { T: 1.8, S: 2 } }, { v: { T: 0.6, S: 3.6 } }] },
    { id: "choc", opts: [
      { v: { T: 4, S: 0.3 } }, { v: { T: 3, S: 1 } }, { v: { T: 1.5, S: 2.5 } }, { v: { T: 0.5, S: 3.6 } }] },
    { id: "sour", opts: [{ v: { A: 4 } }, { v: { A: 2.5 } }, { v: { A: 1 } }] },
    { id: "sweet", opts: [{ v: { S: 0.3 } }, { v: { S: 1.8 } }, { v: { S: 3.6 } }] },
    { id: "milk", opts: [{ v: { B: 1 } }, { v: { B: 2 } }, { v: { B: 3 } }, { v: { B: 4 } }] },
    { id: "flavour", opts: [{ v: { F: "fruit" } }, { v: { F: "floral" } }, { v: { F: "earthy" } }, { v: { F: "smoky" } }] },
    { id: "oak", opts: [{ v: { O: 4, B: 3.5, A: 1.5 } }, { v: { O: 1.5, B: 2.5, A: 2.5 } }, { v: { O: 0, B: 1.5, A: 3.5 } }] },
    { id: "fizz", opts: [{ v: { Z: 2 } }, { v: { Z: 1 } }, { v: { Z: 0 } }] }
  ];

  // How much each question counts towards a dial. Coffee and chocolate share tannin;
  // sourness leads acidity; the drinks question leads sweetness; milk leads body.
  function dials(ans) {
    function v(qi, k) { var o = Q[qi].opts[ans[qi]]; return o && o.v[k]; }
    return {
      A: 0.8 * v(2, "A") + 0.2 * v(6, "A"),
      S: 0.7 * v(3, "S") + 0.15 * v(0, "S") + 0.15 * v(1, "S"),
      T: 0.5 * v(0, "T") + 0.5 * v(1, "T"),
      B: 0.7 * v(4, "B") + 0.3 * v(6, "B"),
      O: v(6, "O"),
      F: v(5, "F"),
      Z: v(7, "Z")
    };
  }

  /* ---------- Style profiles: target dials + flavour families that fit ---------- */
  var P = {
    crisp:    { c: "white", t: { A: 3.8, S: 0.8, B: 2, O: 0 }, f: { earthy: 0.8, fruit: 0.6 } },
    aromatic: { c: "white", t: { A: 2.8, S: 3, B: 2, O: 0 }, f: { floral: 1.5 } },
    round:    { c: "white", t: { A: 2.2, S: 1.2, B: 2.5, O: 1.2 }, f: { fruit: 0.8 } },
    rich:     { c: "white", t: { A: 1.5, S: 1, B: 3.5, O: 3.8 }, f: { smoky: 0.5, fruit: 0.3 } },
    light:    { c: "red", t: { A: 3.5, S: 1.5, T: 1, B: 1.5, O: 1 }, f: { fruit: 0.8, floral: 0.5 } },
    juicy:    { c: "red", t: { A: 1.8, S: 2.5, T: 2, B: 3, O: 2 }, f: { fruit: 1 } },
    bold:     { c: "red", t: { A: 2.2, S: 0.8, T: 4, B: 4, O: 3 }, f: { smoky: 1.5 } },
    savoury:  { c: "red", t: { A: 3.5, S: 0.8, T: 3.3, B: 2.5, O: 2 }, f: { earthy: 1.5, floral: 0.3 } }
  };
  // Whites barely have tannin, so it does not count for them; dry reds are dry, so sweetness counts less.
  var W = { white: { A: 1, S: 1, T: 0, B: 1, O: 0.6 }, red: { A: 1, S: 0.4, T: 1.2, B: 1, O: 0.6 } };

  function rank(d, colour) {
    return Object.keys(P).filter(function (k) { return P[k].c === colour; }).map(function (k) {
      var p = P[k], w = W[colour], sum = 0;
      for (var dim in p.t) sum += w[dim] * Math.pow(d[dim] - p.t[dim], 2);
      return { k: k, s: Math.sqrt(sum) - (p.f[d.F] || 0) };
    }).sort(function (a, b) { return a.s - b.s; });
  }

  /* ---------- Words ---------- */
  var GR = "/grape-varieties/", ST = "/wine-styles/";
  var T = {
    en: {
      langLabel: "Language",
      introEb: "8 questions · about 2 minutes",
      introH: "No wine knowledge needed",
      introP: "Tell us how you take your coffee, which chocolate you reach for and how you feel about lemons. We translate your answers into the language of wine and suggest the styles you are most likely to enjoy.",
      start: "Start the quiz",
      q: "Question", of: "of", back: "Back", why: "Why we ask",
      resEb: "Your palate, in wine words",
      dialA: "Acidity", dialS: "Sweetness", dialT: "Tannin", dialB: "Body",
      bandA: ["Soft and mellow", "Fresh", "Zesty, mouth-watering"],
      bandS: ["Dry", "A touch of sweetness is fine", "Sweet tooth"],
      bandT: ["Smooth, little grip", "Some grip", "Bring on the grip"],
      bandB: ["Light", "Medium", "Full"],
      headA: ["mellow", "fresh", "zesty"], headB: ["light", "medium-bodied", "full-bodied"], headS: ["dry", "just off-dry", "a little sweet"],
      headJoin: function (a, b, s) { return cap(a) + ", " + b + " and " + s; },
      yourWhite: "Your white", yourRed: "Your red", tryThese: "Grapes to try", label: "On a label", runner: "Close second",
      extrasH: "Also worth a glass",
      fizz: ["Bubbles", "Crémant, Cava or Prosecco for every day, Champagne when it is a treat.", ST + "cremant/", "Crémant"],
      sweet: ["Moscato d’Asti", "Sweet, gently fizzy and only about 5% alcohol. A lovely way into sweet wine.", ST + "asti-moscato-d-asti/", "Moscato d’Asti"],
      rose: ["Dry rosé", "Pale, crisp Provence rosé: everything you like in a white, with a hint of red fruit.", ST + "provence-rose/", "Provence rosé"],
      ctaH: "Now taste it for real",
      ctaP: "A quiz is a first guess. In the Winelingo app, every wine you scan and rate fills in your Palate Passport: your taste in reds and whites, with acidity, sweetness, tannin and body, on one card you can show in a wine shop.",
      ctaFine: "Free to download, with Premium for unlimited scans.",
      ctaB: "Get Winelingo on the App Store",
      again: "Take the quiz again", all: "All wine tests",
      honest: "A starting point, not a verdict: taste is personal, and the best test is the glass in front of you."
    },
    da: {
      langLabel: "Sprog",
      introEb: "8 spørgsmål · cirka 2 minutter",
      introH: "Ingen vinviden nødvendig",
      introP: "Fortæl os, hvordan du drikker din kaffe, hvilken chokolade du vælger, og hvad du synes om citroner. Vi oversætter dine svar til vinens sprog og foreslår de stilarter, du med størst sandsynlighed vil holde af.",
      start: "Start quizzen",
      q: "Spørgsmål", of: "af", back: "Tilbage", why: "Derfor spørger vi",
      resEb: "Din gane, sagt med vinord",
      dialA: "Syre", dialS: "Sødme", dialT: "Tannin", dialB: "Fylde",
      bandA: ["Blød og mild", "Frisk", "Syrlig og saftig"],
      bandS: ["Tør", "Lidt sødme er fint", "Sød tand"],
      bandT: ["Blød, lidt greb", "Noget greb", "Gerne masser af greb"],
      bandB: ["Let", "Medium", "Fyldig"],
      headA: ["mild", "frisk", "syrlig"], headB: ["let", "mellemfyldig", "fyldig"], headS: ["tør", "næsten tør", "lidt sød"],
      headJoin: function (a, b, s) { return cap(a) + ", " + b + " og " + s; },
      yourWhite: "Din hvidvin", yourRed: "Din rødvin", tryThese: "Druer du kan prøve", label: "På etiketten", runner: "Tæt på",
      extrasH: "Også værd at smage",
      fizz: ["Bobler", "Crémant, Cava eller Prosecco til hverdag, Champagne når det skal være festligt.", ST + "cremant/", "Crémant"],
      sweet: ["Moscato d’Asti", "Sød, let perlende og kun omkring 5 % alkohol. En dejlig vej ind i søde vine.", ST + "asti-moscato-d-asti/", "Moscato d’Asti"],
      rose: ["Tør rosé", "Lys, sprød rosé fra Provence: alt det, du kan lide ved en hvidvin, med et strejf af rød frugt.", ST + "provence-rose/", "Provence-rosé"],
      ctaH: "Smag det nu i virkeligheden",
      ctaP: "En quiz er et første gæt. I Winelingo-appen fylder hver vin, du scanner og bedømmer, dit Smagspas ud: din smag i rødt og hvidt, med syre, sødme, tannin og fylde, på ét kort, du kan vise i vinhandlen.",
      ctaFine: "Gratis at hente, med Premium til ubegrænsede scanninger.",
      ctaB: "Hent Winelingo i App Store",
      again: "Tag quizzen igen", all: "Alle vintests",
      honest: "Et udgangspunkt, ikke en dom: smag er personlig, og den bedste test er glasset foran dig."
    }
  };

  var QT = {
    en: {
      coffee: ["How do you take your coffee?", ["Black, or an espresso", "With a splash of milk", "Milky: a latte or cappuccino", "Sweet, or no coffee for me"],
        "Black coffee is bitter and roasty. If you enjoy that, the drying grip of tannin in red wine will probably feel familiar."],
      choc: ["Which chocolate do you reach for?", ["Very dark, 85% or more", "Dark, around 70%", "Milk chocolate", "White chocolate or caramel"],
        "Dark chocolate is bitter and a little drying, much like tannin. Sweeter chocolate points to softer, fruitier wines."],
      sour: ["Lemons, grapefruit, sour sweets, green apples?", ["Love them, the sharper the better", "A bit of zing is nice", "Not for me, I like things mellow"],
        "Sourness is acidity, the thing that makes your mouth water. Wine has it too, and it is what makes a wine taste fresh."],
      sweet: ["How sweet do you like your drinks? Think iced tea, lemonade or cocktails.", ["Unsweetened, always", "Just a little sweet", "Properly sweet"],
        "Most wine is dry, with little or no sugar left. A sweet tooth points to off-dry and sweet styles, which are better than their reputation."],
      milk: ["Wine teachers explain body with milk. Which would you pour?", ["Skimmed (skim)", "Semi-skimmed (2%)", "Whole milk", "Cream, if I am honest"],
        "Light wines feel like skimmed milk in the mouth, full ones like whole milk or cream. Alcohol is the main thing that adds body."],
      flavour: ["Pick a bowl from the snack table.", ["Fresh berries and cherries", "Peaches, lychees, something floral", "Olives, mushrooms and herbs", "Something smoky, peppery or char-grilled"],
        "Every wine style has a family of flavours. This tells us which family to start you in."],
      oak: ["Buttered popcorn, vanilla, toast, crème brûlée?", ["Yes please, the richer the better", "Now and then", "Not really, I like things fresh and clean"],
        "These are the flavours oak barrels give a wine: vanilla and toast. The buttery note comes from a winemaking step called malolactic conversion."],
      fizz: ["And bubbles: how do you feel about fizzy drinks?", ["Love them", "Now and then", "I prefer still"],
        "Just for fun: this decides whether we add a sparkling wine to your list."]
    },
    da: {
      coffee: ["Hvordan drikker du din kaffe?", ["Sort, eller en espresso", "Med en sjat mælk", "Med masser af mælk: latte eller cappuccino", "Sød, eller ingen kaffe til mig"],
        "Sort kaffe er bitter og ristet. Kan du lide det, vil tanninens tørrende greb i rødvin nok føles bekendt."],
      choc: ["Hvilken chokolade griber du efter?", ["Meget mørk, 85 % eller mere", "Mørk, omkring 70 %", "Mælkechokolade", "Hvid chokolade eller karamel"],
        "Mørk chokolade er bitter og lidt tørrende, ligesom tannin. Sødere chokolade peger mod blødere, mere frugtige vine."],
      sour: ["Citroner, grapefrugt, sure bolsjer, grønne æbler?", ["Elsker dem, jo surere jo bedre", "Lidt syrlighed er dejligt", "Ikke for mig, jeg kan lide det mildt"],
        "Surhed er syre, det der får munden til at løbe i vand. Vin har det også, og det er syren, der gør en vin frisk."],
      sweet: ["Hvor søde kan du lide dine drikke? Tænk iste, saftevand eller cocktails.", ["Usødet, altid", "Bare lidt sødme", "Rigtig søde"],
        "De fleste vine er tørre, med lidt eller intet sukker tilbage. En sød tand peger mod halvtørre og søde vine, som er bedre end deres ry."],
      milk: ["Vinlærere forklarer fylde med mælk. Hvilken ville du hælde op?", ["Skummetmælk", "Letmælk", "Sødmælk", "Fløde, hvis jeg skal være ærlig"],
        "Lette vine føles som skummetmælk i munden, fyldige som sødmælk eller fløde. Det er især alkoholen, der giver fylde."],
      flavour: ["Vælg en skål fra snackbordet.", ["Friske bær og kirsebær", "Ferskner, litchi, noget blomstret", "Oliven, svampe og krydderurter", "Noget røget, peberagtigt eller grillet"],
        "Hver vinstil har sin familie af smage. Her ser vi, hvilken familie du skal starte i."],
      oak: ["Smørpopcorn, vanilje, ristet brød, crème brûlée?", ["Ja tak, jo fyldigere jo bedre", "En gang imellem", "Ikke rigtig, jeg kan lide det friskt og rent"],
        "Det er de smage, egetræsfade giver en vin: vanilje og ristet brød. Den smøragtige tone kommer fra et trin i vinfremstillingen, der hedder malolaktisk gæring."],
      fizz: ["Og bobler: hvad synes du om drikke med brus?", ["Elsker dem", "En gang imellem", "Jeg foretrækker uden brus"],
        "Bare for sjov: her afgør vi, om der skal en mousserende vin med på din liste."]
    }
  };

  // Grapes: [slug, English name, en note, da note]. Names stay the same in Danish.
  var PT = {
    crisp: {
      en: ["Crisp & zesty whites", "Light, dry and mouth-watering, with citrus, green apple and sometimes a herbal edge. Usually made without oak, so freshness does the talking.", "Look for Sancerre, Marlborough Sauvignon Blanc, Rías Baixas or Chablis."],
      da: ["Sprøde, friske hvidvine", "Lette og tørre vine, der får munden til at løbe i vand, med citrus, grønne æbler og nogle gange et strejf af krydderurter. Som regel uden egetræ, så friskheden får lov at tale.", "Kig efter Sancerre, Sauvignon Blanc fra Marlborough, Rías Baixas eller Chablis."],
      g: [["sauvignon-blanc", "Sauvignon Blanc", "grass, gooseberry and lime", "græs, stikkelsbær og lime"],
          ["albarino", "Albariño", "citrus and a salty sea breeze", "citrus og en salt havbrise"],
          ["gruner-veltliner", "Grüner Veltliner", "green apple and white pepper", "grønne æbler og hvid peber"],
          ["pinot-grigio", "Pinot Grigio", "pale, light, gentle pear", "lys, let, mild pære"]]
    },
    aromatic: {
      en: ["Aromatic & floral whites", "Perfumed wines that smell of peach, lychee, rose and orange blossom. Some are bone-dry, some carry a touch of sweetness; in Riesling, high acidity keeps even the sweet ones fresh.", "For a touch of sweetness, try a Mosel Riesling Kabinett or one labelled feinherb. Trocken on a German label means dry."],
      da: ["Aromatiske, blomstrede hvidvine", "Parfumerede vine, der dufter af fersken, litchi, rose og appelsinblomst. Nogle er knastørre, andre har lidt sødme; i Riesling holder den høje syre selv de søde friske.", "Vil du have lidt sødme, så prøv en Riesling Kabinett fra Mosel eller en mærket feinherb. Trocken på en tysk etiket betyder tør."],
      g: [["riesling", "Riesling", "lime and peach, from dry to sweet", "lime og fersken, fra tør til sød"],
          ["gewurztraminer", "Gewürztraminer", "lychee, rose and spice", "litchi, rose og krydderi"],
          ["moscato", "Moscato", "grapey, gently fizzy, sweet", "druet, let perlende, sød"],
          ["torrontes", "Torrontés", "smells sweet, tastes dry", "dufter sødt, smager tørt"]]
    },
    round: {
      en: ["Smooth & fruity whites", "The middle of the road, in the best way: medium-bodied whites with ripe apple, pear and stone fruit. Fresh but never sharp, with little or no oak.", "Look for Mâcon-Villages, Chenin Blanc from South Africa or Vouvray, or Godello from Valdeorras."],
      da: ["Bløde, frugtige hvidvine", "Midt på vejen, på den gode måde: mellemfyldige hvidvine med modne æbler, pærer og stenfrugt. Friske, men aldrig skarpe, med lidt eller intet egetræ.", "Kig efter Mâcon-Villages, Chenin Blanc fra Sydafrika eller Vouvray, eller Godello fra Valdeorras."],
      g: [["chardonnay", "Chardonnay (unoaked)", "apple, pear, a soft texture", "æble, pære, blød tekstur"],
          ["chenin-blanc", "Chenin Blanc", "quince and apple, lively acidity", "kvæde og æble, livlig syre"],
          ["godello", "Godello", "pear and a nutty depth", "pære og en nøddeagtig dybde"]]
    },
    rich: {
      en: ["Rich & creamy whites", "Full-bodied whites with a soft, rounded feel and lower acidity. Oak barrels add vanilla and toast, and malolactic conversion adds the buttery note.", "Look for “barrel-fermented” or “oak-aged” on the back label, Viognier from Condrieu, or a white Burgundy such as Meursault for a treat."],
      da: ["Fyldige, cremede hvidvine", "Fyldige hvidvine med en blød, rund fornemmelse og mindre syre. Egetræsfade giver vanilje og ristet brød, og malolaktisk gæring giver den smøragtige tone.", "Kig efter “barrel-fermented” eller “oak-aged” på bagetiketten, Viognier fra Condrieu, eller en hvid Bourgogne som Meursault, når det skal være festligt."],
      g: [["chardonnay", "Chardonnay (oaked)", "vanilla, toast and butter", "vanilje, ristet brød og smør"],
          ["viognier", "Viognier", "apricot and white flowers", "abrikos og hvide blomster"],
          ["marsanne", "Marsanne", "pear, almond, waxy texture", "pære, mandel, voksagtig tekstur"],
          ["semillon", "Sémillon", "lemon and wax, honeyed with age", "citron og voks, honning med alderen"]]
    },
    light: {
      en: ["Light & bright reds", "Pale, silky reds with cherry and raspberry, lively acidity and very little grip. The easiest reds to love, and many taste even better slightly chilled.", "Look for Beaujolais (Fleurie or Morgon), Bourgogne Rouge, or Pinot Noir from Oregon or New Zealand. Give it 20 minutes in the fridge."],
      da: ["Lette, friske rødvine", "Lyse, silkebløde rødvine med kirsebær og hindbær, frisk syre og meget lidt greb. De nemmeste rødvine at holde af, og mange smager endnu bedre let kølede.", "Kig efter Beaujolais (Fleurie eller Morgon), Bourgogne Rouge eller Pinot Noir fra Oregon eller New Zealand. Giv den 20 minutter i køleskabet."],
      g: [["pinot-noir", "Pinot Noir", "cherry, raspberry, a touch of earth", "kirsebær, hindbær, et strejf af jord"],
          ["gamay", "Gamay", "juicy red fruit, the grape of Beaujolais", "saftig rød frugt, Beaujolais’ drue"],
          ["zweigelt", "Zweigelt", "sour cherry and a peppery lift", "surkirsebær og et pift af peber"]]
    },
    juicy: {
      en: ["Soft & juicy reds", "Generous, ripe and round: plum, blackberry and strawberry with smooth tannins. Ripe fruit can taste almost sweet even when the wine is dry, which is why sweet-toothed drinkers often love these.", "Look for Côtes du Rhône, Garnacha from Spain, Primitivo from Puglia or Malbec from Mendoza."],
      da: ["Bløde, saftige rødvine", "Gavmilde, modne og runde: blomme, brombær og jordbær med bløde tanniner. Moden frugt kan smage næsten sødt, selv når vinen er tør, og derfor elsker folk med en sød tand ofte disse.", "Kig efter Côtes du Rhône, Garnacha fra Spanien, Primitivo fra Puglia eller Malbec fra Mendoza."],
      g: [["merlot", "Merlot", "plum and soft tannins", "blomme og bløde tanniner"],
          ["grenache", "Grenache", "strawberry and spice", "jordbær og krydderi"],
          ["zinfandel", "Zinfandel / Primitivo", "jammy blackberry, generous", "syltet brombær, gavmild"],
          ["malbec", "Malbec", "plum, velvety tannins", "blomme, fløjlsbløde tanniner"]]
    },
    bold: {
      en: ["Bold & structured reds", "Full-bodied reds with dark fruit, firm tannins and often oak spice: blackcurrant, blackberry, pepper and smoke. They grip, and they shine next to a steak.", "Look for Left Bank Bordeaux, Napa or Coonawarra Cabernet, Barossa Shiraz or a dry red from the Douro."],
      da: ["Kraftige, strukturerede rødvine", "Fyldige rødvine med mørk frugt, faste tanniner og ofte krydderi fra egetræ: solbær, brombær, peber og røg. De griber fat, og de stråler ved siden af en bøf.", "Kig efter Bordeaux fra venstre bred, Cabernet fra Napa eller Coonawarra, Shiraz fra Barossa eller en tør rødvin fra Douro."],
      g: [["cabernet-sauvignon", "Cabernet Sauvignon", "blackcurrant, cedar, firm tannin", "solbær, cedertræ, faste tanniner"],
          ["syrah-shiraz", "Syrah / Shiraz", "blackberry, pepper and smoke", "brombær, peber og røg"],
          ["touriga-nacional", "Touriga Nacional", "dark fruit and violets", "mørk frugt og violer"]]
    },
    savoury: {
      en: ["Savoury & earthy reds", "Fresh acidity and firm tannins with sour cherry, dried herbs, leather and earth. Less about fruit, more about food: the great reds of Italy and Spain.", "Look for Chianti Classico, Rioja Reserva, or Langhe Nebbiolo, a gentler way into Barolo country."],
      da: ["Krydrede, jordede rødvine", "Frisk syre og faste tanniner med surkirsebær, tørrede krydderurter, læder og jord. Mindre frugt, mere mad: de store rødvine fra Italien og Spanien.", "Kig efter Chianti Classico, Rioja Reserva eller Langhe Nebbiolo, en blidere vej ind i Barolos verden."],
      g: [["sangiovese", "Sangiovese", "sour cherry and tomato leaf", "surkirsebær og tomatblad"],
          ["nebbiolo", "Nebbiolo", "tar and roses, firm tannin", "tjære og roser, faste tanniner"],
          ["tempranillo", "Tempranillo", "leather, tobacco, vanilla from oak", "læder, tobak, vanilje fra egetræ"]]
    }
  };

  /* ---------- Helpers ---------- */
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Same cut-offs as the five pips (1–2 low, 3 middle, 4–5 high), so the word always matches the dial.
  function band(x) { return x < 1.5 ? 0 : x < 2.5 ? 1 : 2; }
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === "cls") n.className = props[k];
      else if (k === "text") n.textContent = props[k];
      else n.setAttribute(k, props[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) n.append(c); });
    return n;
  }
  function track(name, data) { try { if (window.umami) umami.track(name, data); } catch (e) {} }
  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem("wl-lang"); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || "en").slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) >= 0 ? n : "en";
  }

  /* ---------- Static page text (hero, guide, FAQ) swaps with the language ---------- */
  var statics = [].slice.call(document.querySelectorAll("[data-pq]"));
  var originals = statics.map(function (n) { return n.innerHTML; });
  var DA_STATIC = window.PQ_DA || {};
  function swapStatics(lang) {
    statics.forEach(function (n, i) {
      var k = n.getAttribute("data-pq");
      n.innerHTML = lang === "da" && DA_STATIC[k] ? DA_STATIC[k] : originals[i];
    });
  }

  /* ---------- Player ---------- */
  var root = document.getElementById("palate-quiz");
  if (!root) return;
  var lang = pickLang(), step = -1, ans = [];

  function setLang(l) {
    lang = l;
    try { localStorage.setItem("wl-lang", l); } catch (e) {}
    var u = new URL(location.href);
    if (l === "en") u.searchParams.delete("lang"); else u.searchParams.set("lang", l);
    history.replaceState(null, "", u);
    draw();
  }

  function langBar() {
    var bar = el("div", { cls: "qz-langs", role: "group", "aria-label": T[lang].langLabel });
    LANGS.forEach(function (l) {
      var b = el("button", { cls: "qz-lang", type: "button", "aria-pressed": String(l === lang), text: NAMES[l] });
      b.addEventListener("click", function () { setLang(l); });
      bar.append(b);
    });
    return bar;
  }

  function focusCard(card) {
    var h = card.querySelector("h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    var r = card.getBoundingClientRect();
    if (r.top < 70 || r.top > window.innerHeight * 0.5) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function draw(moved) {
    var u = T[lang];
    document.documentElement.lang = lang;
    swapStatics(lang);
    root.innerHTML = "";
    var card;
    if (step < 0) card = intro(u);
    else if (step < Q.length) card = question(u);
    else card = result(u);
    root.append(langBar(), card);
    if (moved) focusCard(card);
  }

  function intro(u) {
    var go = el("button", { cls: "btn btn-primary btn-lg pq-start", type: "button", text: u.start });
    go.addEventListener("click", function () { step = 0; ans = []; track("palate-quiz-start", { lang: lang }); draw(true); });
    return el("div", { cls: "qz-card-play pq-intro" }, [
      el("p", { cls: "qz-level", text: u.introEb }),
      el("h2", { cls: "qz-q", text: u.introH }),
      el("p", { cls: "pq-p", text: u.introP }),
      go
    ]);
  }

  function question(u) {
    var q = Q[step], words = QT[lang][q.id];
    var opts = el("div", { cls: "qz-opts pq-opts" + (q.opts.length === 4 ? " four" : "") });
    q.opts.forEach(function (o, i) {
      var b = el("button", { cls: "qz-opt pq-opt" + (ans[step] === i ? " picked" : ""), type: "button", text: words[1][i] });
      b.addEventListener("click", function () {
        ans[step] = i;
        b.classList.add("picked");
        opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
        // The pick springs first, then the card eases out before the next one lands (palate-quiz.css).
        setTimeout(function () { card.classList.add("leaving"); }, 170);
        setTimeout(function () {
          step++;
          if (step === Q.length) { var r = matches(); track("palate-quiz-done", { lang: lang, white: r.white[0].k, red: r.red[0].k }); }
          draw(true);
        }, 330);
      });
      opts.append(b);
    });
    var backBtn = el("button", { cls: "pq-back", type: "button", text: "← " + u.back });
    backBtn.addEventListener("click", function () { step--; draw(true); });
    var card = el("div", { cls: "qz-card-play pq-q" }, [
      el("div", { cls: "qz-progress" }, [
        el("span", { text: u.q + " " + (step + 1) + " " + u.of + " " + Q.length }),
        el("div", { cls: "qz-track", "aria-hidden": "true" }, [el("div", { cls: "qz-fill", style: "width:" + Math.round(step / Q.length * 100) + "%" })])
      ]),
      el("h2", { cls: "qz-q", text: words[0] }),
      opts,
      el("p", { cls: "pq-why" }, [el("strong", { text: u.why + ": " }), words[2]]),
      backBtn
    ]);
    return card;
  }

  function matches() {
    var d = dials(ans);
    return { d: d, white: rank(d, "white"), red: rank(d, "red") };
  }

  function dialRow(name, value, words) {
    var n = Math.max(1, Math.min(5, Math.round(value) + 1)), pips = el("span", { cls: "pq-pips", "aria-hidden": "true" });
    for (var i = 1; i <= 5; i++) pips.append(el("span", { cls: i <= n ? "on" : "" }));
    var word = words[band(value)];
    return el("div", { cls: "pq-dial" }, [
      el("span", { cls: "pq-dn", text: name }), pips, el("span", { cls: "pq-dw", text: word })
    ]);
  }

  function matchCard(u, colour, ranked) {
    var k = ranked[0].k, p = PT[k], w = p[lang], next = PT[ranked[1].k][lang][0];
    var list = el("ul", { cls: "pq-grapes" }, p.g.map(function (g) {
      return el("li", null, [el("a", { href: GR + g[0] + "/" , text: g[1] }), el("span", { text: " · " + (lang === "da" ? g[3] : g[2]) })]);
    }));
    return el("article", { cls: "pq-match pq-" + colour }, [
      el("p", { cls: "pq-type" }, [el("span", { cls: "pq-dot", "aria-hidden": "true" }), colour === "white" ? u.yourWhite : u.yourRed]),
      el("h3", { text: w[0] }),
      el("p", { cls: "pq-desc", text: w[1] }),
      el("p", { cls: "pq-sub", text: u.tryThese }),
      list,
      el("p", { cls: "pq-label" }, [el("strong", { text: u.label + ": " }), w[2]]),
      el("p", { cls: "pq-runner", text: u.runner + ": " + next.toLowerCase() })
    ]);
  }

  function result(u) {
    var r = matches(), d = r.d;
    var head = u.headJoin(u.headA[band(d.A)], u.headB[band(d.B)], u.headS[band(d.S)]);
    var extras = [];
    if (d.Z >= 2) extras.push(u.fizz);
    if (d.S >= 2.9) extras.push(u.sweet);
    if (d.A >= 3 && d.B <= 2.2) extras.push(u.rose);
    // The colour you are closer to leads; on a phone it is read first.
    var whiteFirst = r.white[0].s <= r.red[0].s;
    var cards = [matchCard(u, "white", r.white), matchCard(u, "red", r.red)];
    if (!whiteFirst) cards.reverse();
    var again = el("button", { cls: "btn btn-ghost", type: "button", text: u.again });
    again.addEventListener("click", function () { step = -1; ans = []; draw(true); });
    return el("div", { cls: "qz-card-play pq-result" }, [
      el("p", { cls: "qz-level", text: u.resEb }),
      el("h2", { cls: "pq-head", text: head }),
      el("div", { cls: "pq-dials" }, [
        dialRow(u.dialA, d.A, u.bandA), dialRow(u.dialS, d.S, u.bandS),
        dialRow(u.dialT, d.T, u.bandT), dialRow(u.dialB, d.B, u.bandB)
      ]),
      el("div", { cls: "pq-matches" }, cards),
      extras.length ? el("div", { cls: "pq-extras" }, [el("p", { cls: "pq-sub", text: u.extrasH })].concat(extras.map(function (x) {
        return el("p", null, [el("a", { href: x[2], text: x[0] }), " " + x[1]]);
      }))) : null,
      el("p", { cls: "pq-honest", text: u.honest }),
      el("div", { cls: "qz-cta pq-cta" }, [
        el("h3", { text: u.ctaH }), el("p", { text: u.ctaP }),
        el("a", { cls: "btn btn-primary", href: APP, "data-cta": "palate-quiz-result", text: u.ctaB }),
        el("p", { cls: "pq-fine", text: u.ctaFine })
      ]),
      el("div", { cls: "qz-row" }, [again, el("a", { cls: "btn btn-ghost", href: "/tests/" + (lang === "en" ? "" : "?lang=" + lang), text: u.all })])
    ]);
  }

  draw();
})();
