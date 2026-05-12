/* ==========================================================================
 * words.js — Daily-word selection + curated word lists
 *
 * ANSWERS is the pool of possible solutions. One is picked per day,
 * deterministically by the date index. Every player in the world gets
 * the same word on the same day.
 *
 * VALID is the union of ANSWERS plus a broader set of common English
 * five-letter words, so most reasonable guesses are accepted (the
 * "not in word list" rejection is the single most frustrating UX failure
 * in Wordle clones).
 *
 * The launch date is the day-zero anchor: ANSWERS[0] is what plays on
 * LAUNCH_DATE in America/Chicago time. Day N = ANSWERS[N % ANSWERS.length].
 * ========================================================================== */

// First day of the game. ANSWERS[0] plays on this date (Chicago time).
export const LAUNCH_DATE = '2026-05-12';

/* --------------------------------------------------------------------------
 * ANSWERS — daily solutions
 *
 * Curated mix:
 *   - ~40% coffee, drinks, brewing vocabulary
 *   - ~25% New Orleans / Louisiana culture
 *   - ~35% common English (so the puzzle is actually beatable)
 *
 * All words are five letters, all real, all in standard dictionaries.
 * Keep entries unique and uppercase.
 * -------------------------------------------------------------------------- */
// Themes are interleaved (coffee → NOLA → general → coffee → ...) so a
// player who plays every day can't lean on the theme to narrow guesses.
// Day 0 is BAYOU on purpose: it hints at the New Orleans angle without
// being a giveaway, and the unusual letter pattern is a good first puzzle.
// GRIND is reserved for ~day 30 as a "of course, the daily grind" wink.
export const ANSWERS = [
  // Day 0 — the launch puzzle
  'BAYOU',

  // ----- Days 1–60 (mixed themes, every third or so is a coffee word) -----
  'HEART', 'ROAST', 'NIGHT', 'BEANS', 'PORCH', 'STORM', 'BLEND', 'MUSIC',
  'GUMBO', 'COAST', 'MOCHA', 'EARTH', 'LEVEE', 'CREAM', 'DREAM', 'JAZZY',
  'BREWS', 'PEARL', 'FRESH', 'LIGHT', 'BLUES', 'STEAM', 'RIVER', 'CRACK',
  'SHORE', 'FLOAT', 'PRESS', 'BRAVE', 'BEADS', 'TOAST', 'CLOUD', 'BRASS',
  'GRIND',  // ~day 30 — the wink
  'SMOKE', 'SAINT', 'WORLD', 'CRUMB', 'TRACE', 'BERRY', 'GRACE', 'CREMA',
  'BLOOM', 'FROTH', 'SHADE', 'PEACE', 'DRUMS', 'AROMA', 'HOUSE', 'CACAO',
  'NOBLE', 'LATTE', 'HAPPY', 'DECAF', 'FRAME', 'MASKS', 'SHARP', 'BANJO',
  'SUGAR', 'PRIDE',

  // ----- Days 61–120 -----
  'POURS', 'SOUND', 'CIDER', 'EIGHT', 'FOAMY', 'SHELL', 'BREAD', 'PIANO',
  'SHINE', 'WHEAT', 'TRUST', 'HONEY', 'OCEAN', 'COCOA', 'CRAFT', 'JUICE',
  'NORTH', 'WHISK', 'PROUD', 'SPICE', 'SOUTH', 'TASTE', 'EARLY', 'GLASS',
  'TEACH', 'MELON', 'BEACH', 'GRAPE', 'CHIEF', 'PEACH', 'CLEAR', 'SCONE',
  'SWEET', 'FLOOD', 'POWER', 'PEARS', 'PLACE', 'STAGE', 'QUIET', 'YEAST',
  'TIGHT', 'APPLE', 'TODAY', 'PASTE', 'LEMON', 'WHITE', 'CABLE', 'BRING',
  'BUILD', 'WALTZ', 'CARRY', 'BLOCK', 'CATCH', 'CHART', 'CHAIR', 'CHILD',
  'CLEAN', 'CLIMB',

  // ----- Days 121–180 -----
  'CLOSE', 'COLOR', 'COULD', 'COUNT', 'COVER', 'DOZEN', 'DRINK', 'DRIVE',
  'ENJOY', 'EVERY', 'FAITH', 'FIELD', 'FIGHT', 'FINAL', 'FIRST', 'FLAME',
  'FLOOR', 'FORTH', 'FOUND', 'GIANT', 'GIVEN', 'GLOBE', 'GREAT', 'GREEN',
  'GROUP', 'GUARD', 'GUESS', 'GUEST', 'HEAVY', 'HOTEL', 'HUMAN', 'IDEAS',
  'IMAGE', 'JOINT', 'JUDGE', 'KNOWN', 'LARGE', 'LATER', 'LEARN', 'LEAVE',
  'LEGAL', 'LEVEL', 'LIVES', 'LOCAL', 'LUCKY', 'MAJOR', 'MAYBE', 'MEANT',
  'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MODEL', 'MONEY', 'MOUNT', 'MOUTH',
  'MOVED', 'NEEDS',

  // ----- Days 181–240 -----
  'NEVER', 'NEWER', 'NOISE', 'NURSE', 'OFFER', 'ORDER', 'OTHER', 'OUGHT',
  'OWNER', 'PAINT', 'PAPER', 'PARTY', 'PHASE', 'PHONE', 'PHOTO', 'PIECE',
  'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'PRICE', 'PRIME',
  'PRINT', 'PRIOR', 'PROOF', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID',
  'READY', 'REFER', 'REACH', 'REALM', 'RIGHT', 'ROUND', 'ROUTE', 'RURAL',
  'ROYAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN',
  'SHALL', 'SHAPE', 'SHARE', 'SHEET', 'SHELF', 'SHIFT', 'SHIRT', 'SHOCK',
  'SHOOT', 'SHORT',

  // ----- Days 241–300 -----
  'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP',
  'SLIDE', 'SMALL', 'SMART', 'SMITH', 'SOLID', 'SOLVE', 'SORRY', 'SPACE',
  'SPARE', 'SPEAK', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT', 'STAFF',
  'STAKE', 'STAND', 'START', 'STATE', 'STEEL', 'STEEP', 'STERN', 'STICK',
  'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORY', 'STRIP', 'STUCK',
  'STUDY', 'STUFF', 'STYLE', 'SUITE', 'SUPER', 'TABLE', 'TAKEN', 'TAXES',
  'TERMS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK',
  'THING', 'THINK',

  // ----- Days 301–397 -----
  'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIMER', 'TOTAL', 'TOUCH',
  'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL',
  'TRIBE', 'TRICK', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUTH', 'TWICE',
  'UNDER', 'UNDUE', 'UNION', 'UNTIL', 'UPPER', 'URBAN', 'USAGE', 'USUAL',
  'VALID', 'VALUE', 'VIDEO', 'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WATER',
  'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHOLE', 'WHOSE', 'WOMAN', 'WORRY',
  'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'WROTE',
  'YIELD', 'YOUNG', 'YOUTH', 'TANGO', 'STIRS', 'ICING', 'SHOTS', 'TRUMP',
  'HONOR', 'DAILY', 'CHOSE', 'CROWN', 'BLAZE', 'DRIFT', 'GHOST',
  'OASIS', 'MERIT', 'FEAST',
];

/* --------------------------------------------------------------------------
 * VALID_EXTRA — words accepted as guesses but never chosen as the answer.
 *
 * This is the safety net so players can input reasonable guesses without
 * the dreaded "not in word list" rejection. NYT's Wordle bundles ~12,972
 * five-letter words here. We're starting smaller and will grow over time
 * based on actual player input — every "not in word list" rejection that
 * was actually a real word can be added on the next deploy.
 * -------------------------------------------------------------------------- */
const VALID_EXTRA = [
  'AAHED', 'ABACI', 'ABACK', 'ABAFT', 'ABASE', 'ABATE', 'ABBEY', 'ABBOT',
  'ABEAM', 'ABETS', 'ABHOR', 'ABIDE', 'ABLED', 'ABLER', 'ABODE', 'ABOUT',
  'ABOVE', 'ABUSE', 'ABYSS', 'ACING', 'ACORN', 'ACRID', 'ACTED', 'ACTOR',
  'ACUTE', 'ADAGE', 'ADAPT', 'ADDED', 'ADDER', 'ADEPT', 'ADIEU', 'ADMIN',
  'ADMIT', 'ADOBE', 'ADOPT', 'ADORE', 'ADORN', 'ADULT', 'AFFIX', 'AFIRE',
  'AFOOT', 'AFOUL', 'AFTER', 'AGAIN', 'AGAPE', 'AGATE', 'AGENT', 'AGILE',
  'AGING', 'AGLOW', 'AGONY', 'AGREE', 'AHEAD', 'AIDED', 'AIDES', 'AIMED',
  'AIRED', 'AISLE', 'ALARM', 'ALBUM', 'ALERT', 'ALGAE', 'ALIAS', 'ALIBI',
  'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLAY', 'ALLEY', 'ALLOT', 'ALLOW',
  'ALLOY', 'ALOFT', 'ALONE', 'ALONG', 'ALOOF', 'ALOUD', 'ALPHA', 'ALTAR',
  'ALTER', 'AMASS', 'AMAZE', 'AMBER', 'AMBLE', 'AMEND', 'AMIDS', 'AMISS',
  'AMITY', 'AMONG', 'AMPLE', 'AMPLY', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY',
  'ANGST', 'ANKLE', 'ANNEX', 'ANNOY', 'ANNUL', 'ANTIC', 'ANVIL', 'AORTA',
  'APART', 'APHID', 'APING', 'APNEA', 'APPLY', 'APRON', 'APTLY', 'ARDOR',
  'ARENA', 'ARGUE', 'ARISE', 'ARMED', 'AROSE', 'ARRAY', 'ARROW', 'ARSON',
  'ARTSY', 'ASCOT', 'ASHEN', 'ASIDE', 'ASKED', 'ASKEW', 'ASSAY', 'ASSET',
  'ATOLL', 'ATONE', 'ATTIC', 'AUDIO', 'AUDIT', 'AUGUR', 'AUNTS', 'AURAL',
  'AVAIL', 'AVERT', 'AVIAN', 'AVOID', 'AWAIT', 'AWAKE', 'AWARD', 'AWARE',
  'AWASH', 'AWFUL', 'AWOKE', 'AXIAL', 'AXIOM', 'AZURE', 'BACON', 'BADGE',
  'BADLY', 'BAGEL', 'BAGGY', 'BAKED', 'BAKER', 'BALDY', 'BALER', 'BALMY',
  'BANAL', 'BANGS', 'BANJO', 'BARGE', 'BARON', 'BASED', 'BASIC', 'BASIN',
  'BASIS', 'BASTE', 'BATCH', 'BATHE', 'BATON', 'BATTY', 'BAWDY', 'BAYOU',
  'BEACH', 'BEADY', 'BEAMS', 'BEARD', 'BEAST', 'BEATS', 'BECKY', 'BEEFY',
  'BEFIT', 'BEGAN', 'BEGAT', 'BEGET', 'BEGIN', 'BEGUN', 'BEING', 'BELCH',
  'BELIE', 'BELLE', 'BELLY', 'BELOW', 'BENCH', 'BERET', 'BERTH', 'BESET',
  'BESTS', 'BEVEL', 'BEZEL', 'BIBLE', 'BICEP', 'BIDDY', 'BIGHT', 'BIGOT',
  'BILGE', 'BILLY', 'BINGE', 'BINGO', 'BIOME', 'BIRCH', 'BIRTH', 'BISON',
  'BITTY', 'BLACK', 'BLADE', 'BLAME', 'BLAND', 'BLANK', 'BLAST', 'BLEAK',
  'BLEAT', 'BLEED', 'BLEND', 'BLESS', 'BLIMP', 'BLIND', 'BLINK', 'BLISS',
  'BLITZ', 'BLOAT', 'BLOCK', 'BLOKE', 'BLOND', 'BLOOD', 'BLOOM', 'BLOWN',
  'BLUER', 'BLUFF', 'BLUNT', 'BLURB', 'BLURT', 'BLUSH', 'BOARD', 'BOAST',
  'BOBBY', 'BOGEY', 'BOGGY', 'BOILS', 'BONES', 'BONGO', 'BONUS', 'BOOBY',
  'BOOMS', 'BOOST', 'BOOTH', 'BOOTS', 'BOOTY', 'BOOZE', 'BORAX', 'BORED',
  'BORER', 'BORNE', 'BOSOM', 'BOSSY', 'BOTCH', 'BOUGH', 'BOULE', 'BOUND',
  'BOUTS', 'BOWED', 'BOWEL', 'BOWER', 'BOXER', 'BRACE', 'BRAID', 'BRAIN',
  'BRAKE', 'BRAND', 'BRASH', 'BRAVE', 'BRAVO', 'BRAWL', 'BRAWN', 'BREAD',
  'BREAK', 'BREED', 'BRIAR', 'BRIBE', 'BRICK', 'BRIDE', 'BRIEF', 'BRINE',
  'BRING', 'BRINK', 'BRINY', 'BRISK', 'BROAD', 'BROIL', 'BROKE', 'BROOD',
  'BROOK', 'BROOM', 'BROTH', 'BROWN', 'BRUNT', 'BRUSH', 'BRUTE', 'BUDDY',
  'BUDGE', 'BUGGY', 'BUGLE', 'BUILD', 'BUILT', 'BULGE', 'BULKY', 'BULLY',
  'BUMPY', 'BUNCH', 'BUNNY', 'BURLY', 'BURNT', 'BURST', 'BUSED', 'BUSHY',
  'BUTCH', 'BUTTE', 'BUYER', 'BYLAW', 'CABAL', 'CABBY', 'CABIN', 'CABLE',
  'CACAO', 'CACHE', 'CACTI', 'CADDY', 'CADET', 'CAGEY', 'CAIRN', 'CAMEL',
  'CAMEO', 'CANAL', 'CANDY', 'CANNY', 'CANOE', 'CANON', 'CAPER', 'CAPUT',
  'CARAT', 'CARGO', 'CAROL', 'CARRY', 'CARVE', 'CASTE', 'CATCH', 'CATER',
  'CATTY', 'CAULK', 'CAUSE', 'CAVIL', 'CEASE', 'CEDAR', 'CELLO', 'CHAFE',
  'CHAFF', 'CHAIN', 'CHAIR', 'CHALK', 'CHAMP', 'CHANT', 'CHAOS', 'CHAPS',
  'CHARD', 'CHARM', 'CHART', 'CHASE', 'CHASM', 'CHEAP', 'CHEAT', 'CHECK',
  'CHEEK', 'CHEER', 'CHESS', 'CHEST', 'CHICK', 'CHIDE', 'CHIEF', 'CHILD',
  'CHILE', 'CHILI', 'CHILL', 'CHIME', 'CHINA', 'CHIRP', 'CHOCK', 'CHOIR',
  'CHOKE', 'CHORD', 'CHORE', 'CHOSE', 'CHUCK', 'CHUMP', 'CHUNK', 'CHURN',
  'CHUTE', 'CIDER', 'CIGAR', 'CINCH', 'CIRCA', 'CIVIC', 'CIVIL', 'CLACK',
  'CLAIM', 'CLAMP', 'CLANG', 'CLANK', 'CLASH', 'CLASP', 'CLASS', 'CLEAN',
  'CLEAR', 'CLEAT', 'CLEFT', 'CLERK', 'CLICK', 'CLIFF', 'CLIMB', 'CLING',
  'CLINK', 'CLOAK', 'CLOCK', 'CLONE', 'CLOSE', 'CLOTH', 'CLOUD', 'CLOUT',
  'CLOVE', 'CLOWN', 'CLUCK', 'CLUED', 'CLUMP', 'CLUNG', 'COACH', 'COAST',
  'COBRA', 'COCOA', 'COLON', 'COLOR', 'COMET', 'COMFY', 'COMIC', 'COMMA',
  'CONCH', 'CONDO', 'CONIC', 'COPRA', 'CORAL', 'CORER', 'CORNY', 'COUCH',
  'COUGH', 'COULD', 'COUNT', 'COUPE', 'COURT', 'COVEN', 'COVER', 'COVET',
  'COVEY', 'COWED', 'COWER', 'COYLY', 'CRACK', 'CRAFT', 'CRAMP', 'CRANE',
  'CRANK', 'CRASH', 'CRASS', 'CRATE', 'CRAVE', 'CRAWL', 'CRAZE', 'CRAZY',
  'CREAK', 'CREAM', 'CREDO', 'CREED', 'CREEK', 'CREEP', 'CREME', 'CREPE',
  'CREPT', 'CRESS', 'CREST', 'CREWS', 'CRICK', 'CRIED', 'CRIER', 'CRIME',
  'CRIMP', 'CRISP', 'CROAK', 'CROCK', 'CRONE', 'CRONY', 'CROOK', 'CROSS',
  'CROUP', 'CROWD', 'CROWN', 'CRUDE', 'CRUEL', 'CRUMB', 'CRUMP', 'CRUSH',
  'CRUST', 'CRYPT', 'CUBIC', 'CUMIN', 'CURIO', 'CURLY', 'CURRY', 'CURSE',
  'CURVE', 'CURVY', 'CUTIE', 'CYBER', 'CYCLE', 'CYNIC', 'DADDY', 'DAILY',
  'DAIRY', 'DAISY', 'DALLY', 'DANCE', 'DANDY', 'DATED', 'DATER', 'DAUNT',
  'DEALS', 'DEALT', 'DEATH', 'DEBAR', 'DEBIT', 'DEBUG', 'DEBUT', 'DECAL',
  'DECAY', 'DECOR', 'DECOY', 'DECRY', 'DEEDS', 'DEFER', 'DEIFY', 'DEIGN',
  'DEITY', 'DELAY', 'DELTA', 'DELVE', 'DEMON', 'DEMUR', 'DENIM', 'DENSE',
  'DEPOT', 'DEPTH', 'DERBY', 'DETER', 'DEVIL', 'DIARY', 'DICED', 'DICEY',
  'DIGIT', 'DIMER', 'DIMLY', 'DINER', 'DINGO', 'DINGY', 'DIRGE', 'DIRTY',
  'DISCO', 'DITCH', 'DITTY', 'DIVAS', 'DIZZY', 'DODGE', 'DODGY', 'DOGMA',
  'DOING', 'DOLLY', 'DONOR', 'DONUT', 'DOPEY', 'DOUBT', 'DOUGH', 'DOWDY',
  'DOWEL', 'DOWNY', 'DOWRY', 'DOZED', 'DOZEN', 'DRAFT', 'DRAIN', 'DRAKE',
  'DRAMA', 'DRANK', 'DRAPE', 'DRAWL', 'DRAWN', 'DREAD', 'DREAM', 'DRESS',
  'DRIED', 'DRIER', 'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROIT', 'DROLL',
  'DRONE', 'DROOL', 'DROOP', 'DROSS', 'DROVE', 'DROWN', 'DRUID', 'DRUNK',
  'DRYER', 'DRYLY', 'DUCAL', 'DUCHY', 'DUCHY', 'DULLY', 'DUMMY', 'DUMPY',
  'DUNCE', 'DUSKY', 'DUSTY', 'DUTCH', 'EAGER', 'EAGLE', 'EARLY', 'EARTH',
  'EASEL', 'EATEN', 'EATER', 'EBONY', 'ECLAT', 'EDICT', 'EDIFY', 'EERIE',
  'EGRET', 'EIGHT', 'EJECT', 'EKING', 'ELBOW', 'ELDER', 'ELECT', 'ELEGY',
  'ELFIN', 'ELITE', 'ELOPE', 'ELUDE', 'ELVES', 'EMAIL', 'EMBED', 'EMBER',
  'EMCEE', 'EMPTY', 'ENACT', 'ENDOW', 'ENEMY', 'ENJOY', 'ENNUI', 'ENROL',
  'ENSUE', 'ENTER', 'ENTRY', 'ENVOY', 'EPOCH', 'EPOXY', 'EQUAL', 'EQUIP',
  'ERASE', 'ERECT', 'ERROR', 'ERUPT', 'ESSAY', 'ESTER', 'ETHER', 'ETHIC',
  'ETHOS', 'EVADE', 'EVENT', 'EVERY', 'EVICT', 'EVOKE', 'EXACT', 'EXALT',
  'EXCEL', 'EXERT', 'EXILE', 'EXIST', 'EXTOL', 'EXTRA', 'EXULT', 'EYING',
  'FABLE', 'FACED', 'FACET', 'FAINT', 'FAIRY', 'FAITH', 'FALSE', 'FANCY',
  'FANNY', 'FARCE', 'FATAL', 'FATED', 'FATTY', 'FAULT', 'FAUNA', 'FAVOR',
  'FEAST', 'FECAL', 'FEIGN', 'FELLA', 'FELON', 'FEMME', 'FEMUR', 'FENCE',
  'FERAL', 'FERRY', 'FETAL', 'FETCH', 'FETED', 'FETID', 'FIBER', 'FICUS',
  'FIELD', 'FIEND', 'FIERY', 'FIFTH', 'FIFTY', 'FIGHT', 'FILER', 'FILET',
  'FILLY', 'FILMY', 'FILTH', 'FINAL', 'FINCH', 'FINER', 'FIRMS', 'FIRST',
  'FISHY', 'FIXER', 'FIZZY', 'FJORD', 'FLACK', 'FLAIL', 'FLAIR', 'FLAKE',
  'FLAKY', 'FLAME', 'FLANK', 'FLARE', 'FLASH', 'FLASK', 'FLECK', 'FLEET',
  'FLESH', 'FLICK', 'FLIER', 'FLING', 'FLINT', 'FLIRT', 'FLOAT', 'FLOCK',
  'FLOOD', 'FLOOR', 'FLORA', 'FLOSS', 'FLOUR', 'FLOUT', 'FLOWN', 'FLUFF',
  'FLUID', 'FLUKE', 'FLUNG', 'FLUNK', 'FLUSH', 'FLUTE', 'FLYER', 'FOAMY',
  'FOCAL', 'FOCUS', 'FOGGY', 'FOIST', 'FOLIO', 'FOLLY', 'FORAY', 'FORCE',
  'FORGE', 'FORGO', 'FORTE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FOYER',
  'FRAIL', 'FRAME', 'FRANK', 'FRAUD', 'FREAK', 'FREED', 'FREER', 'FRESH',
  'FRIAR', 'FRIED', 'FRILL', 'FRISK', 'FRITZ', 'FROCK', 'FROND', 'FRONT',
  'FROST', 'FROTH', 'FROWN', 'FROZE', 'FRUIT', 'FUDGE', 'FUGUE', 'FULLY',
  'FUNGI', 'FUNKY', 'FUNNY', 'FUROR', 'FURRY', 'FUSSY', 'FUZZY', 'GAFFE',
  'GAILY', 'GAMER', 'GAMMA', 'GAMUT', 'GASSY', 'GAUDY', 'GAUGE', 'GAUNT',
  'GAUZE', 'GAVEL', 'GAWKY', 'GAYER', 'GAYLY', 'GAZER', 'GECKO', 'GEEKY',
  'GEESE', 'GENIE', 'GENRE', 'GHOST', 'GHOUL', 'GIANT', 'GIDDY', 'GIPSY',
  'GIRLY', 'GIRTH', 'GIVEN', 'GIVER', 'GLADE', 'GLAND', 'GLARE', 'GLASS',
  'GLAZE', 'GLEAM', 'GLEAN', 'GLIDE', 'GLINT', 'GLOAT', 'GLOBE', 'GLOOM',
  'GLORY', 'GLOSS', 'GLOVE', 'GLYPH', 'GNASH', 'GNOME', 'GODLY', 'GOING',
  'GOLEM', 'GOLLY', 'GONAD', 'GONER', 'GOODY', 'GOOEY', 'GOOFY', 'GOOSE',
  'GORGE', 'GOUGE', 'GOURD', 'GRACE', 'GRADE', 'GRAFT', 'GRAIN', 'GRAND',
  'GRANT', 'GRAPE', 'GRAPH', 'GRASP', 'GRASS', 'GRATE', 'GRAVE', 'GRAVY',
  'GRAZE', 'GREAT', 'GREED', 'GREEN', 'GREET', 'GRIEF', 'GRILL', 'GRIME',
  'GRIMY', 'GRIND', 'GRIPE', 'GROAN', 'GROIN', 'GROOM', 'GROPE', 'GROSS',
  'GROUP', 'GROUT', 'GROVE', 'GROWN', 'GRUEL', 'GRUFF', 'GRUNT', 'GUARD',
  'GUAVA', 'GUESS', 'GUEST', 'GUIDE', 'GUILD', 'GUILE', 'GUILT', 'GUISE',
  'GULCH', 'GULLY', 'GUMBO', 'GUMMY', 'GUPPY', 'GUSTO', 'GUSTY', 'GYPSY',
  'HABIT', 'HAIRY', 'HALVE', 'HANDS', 'HANDY', 'HAPPY', 'HARDY', 'HAREM',
  'HARPY', 'HARRY', 'HARSH', 'HASTE', 'HASTY', 'HATCH', 'HATED', 'HATER',
  'HAUNT', 'HAVEN', 'HAVOC', 'HAZEL', 'HEADS', 'HEADY', 'HEARD', 'HEART',
  'HEATH', 'HEAVE', 'HEAVY', 'HEDGE', 'HEFTY', 'HELIX', 'HELLO', 'HENCE',
  'HERON', 'HILLY', 'HINGE', 'HIPPO', 'HIPPY', 'HITCH', 'HIVES', 'HOARD',
  'HOARY', 'HOBBY', 'HOIST', 'HOLLY', 'HOMER', 'HONEY', 'HONOR', 'HORDE',
  'HORNY', 'HORSE', 'HOSED', 'HOTEL', 'HOTLY', 'HOUND', 'HOUSE', 'HOVEL',
  'HOVER', 'HOWDY', 'HUMAN', 'HUMID', 'HUMOR', 'HUMPH', 'HUMUS', 'HUNCH',
  'HUNKY', 'HURRY', 'HUSKY', 'HUSSY', 'HUTCH', 'HYDRO', 'HYENA', 'HYMEN',
  'HYPER', 'ICILY', 'IDEAL', 'IDIOM', 'IDIOT', 'IDLER', 'IDYLL', 'IGLOO',
  'ILIAC', 'IMAGE', 'IMBUE', 'IMPEL', 'IMPLY', 'INANE', 'INBOX', 'INCUR',
  'INDEX', 'INEPT', 'INERT', 'INFER', 'INGOT', 'INLAY', 'INLET', 'INNER',
  'INPUT', 'INTER', 'INTRO', 'IONIC', 'IRATE', 'IRONY', 'ISLET', 'ISSUE',
  'ITCHY', 'IVORY', 'JAUNT', 'JAZZY', 'JELLY', 'JERKY', 'JETTY', 'JEWEL',
  'JIFFY', 'JOINT', 'JOIST', 'JOKER', 'JOLLY', 'JOUST', 'JUDGE', 'JUICE',
  'JUICY', 'JUMBO', 'JUMPY', 'JUNTA', 'JUROR', 'KAPPA', 'KARMA', 'KAYAK',
  'KEBAB', 'KHAKI', 'KINKY', 'KIOSK', 'KITTY', 'KNACK', 'KNAVE', 'KNEAD',
  'KNEED', 'KNEEL', 'KNELT', 'KNIFE', 'KNOCK', 'KNOLL', 'KNOWN', 'KOALA',
  'KRILL', 'LABEL', 'LABOR', 'LADEN', 'LADLE', 'LAGER', 'LANCE', 'LANKY',
  'LAPEL', 'LAPSE', 'LARGE', 'LARVA', 'LASSO', 'LATCH', 'LATER', 'LATHE',
  'LATTE', 'LAUGH', 'LAYER', 'LEACH', 'LEAFY', 'LEAKY', 'LEANT', 'LEAPT',
  'LEARN', 'LEASE', 'LEASH', 'LEAST', 'LEAVE', 'LEDGE', 'LEECH', 'LEERY',
  'LEFTY', 'LEGAL', 'LEGGY', 'LEMON', 'LEMUR', 'LEPER', 'LEVEE', 'LEVEL',
  'LEVER', 'LIBEL', 'LIEGE', 'LIGHT', 'LIKED', 'LIKEN', 'LILAC', 'LIMBO',
  'LIMIT', 'LINEN', 'LINER', 'LINGO', 'LIPID', 'LITHE', 'LIVED', 'LIVER',
  'LIVID', 'LLAMA', 'LOATH', 'LOBBY', 'LOCAL', 'LOCUS', 'LODGE', 'LOFTY',
  'LOGIC', 'LOGIN', 'LOOPY', 'LOOSE', 'LORRY', 'LOSER', 'LOUSE', 'LOUSY',
  'LOVER', 'LOWER', 'LOWLY', 'LOYAL', 'LUCID', 'LUCKY', 'LUMEN', 'LUMPY',
  'LUNAR', 'LUNCH', 'LUNGE', 'LUPUS', 'LURCH', 'LURID', 'LUSTY', 'LYING',
  'LYMPH', 'LYRIC', 'MACAW', 'MACHO', 'MACRO', 'MADAM', 'MADLY', 'MAFIA',
  'MAGIC', 'MAGMA', 'MAIZE', 'MAJOR', 'MAKER', 'MAMBO', 'MAMMA', 'MAMMY',
  'MANGA', 'MANGE', 'MANGO', 'MANGY', 'MANIA', 'MANIC', 'MANLY', 'MANOR',
  'MAPLE', 'MARCH', 'MARRY', 'MARSH', 'MASON', 'MASSE', 'MATCH', 'MATEY',
  'MATHS', 'MATTE', 'MAUVE', 'MAVEN', 'MAXIM', 'MAYBE', 'MAYOR', 'MEALY',
  'MEANT', 'MEATY', 'MECCA', 'MEDAL', 'MEDIA', 'MEDIC', 'MELEE', 'MELON',
  'MERCY', 'MERGE', 'MERIT', 'MERRY', 'METAL', 'METER', 'METRO', 'MICRO',
  'MIDGE', 'MIDST', 'MIGHT', 'MILKY', 'MIMIC', 'MINCE', 'MINER', 'MINIM',
  'MINOR', 'MINTY', 'MINUS', 'MIRTH', 'MISER', 'MISSY', 'MOCHA', 'MODAL',
  'MODEL', 'MODEM', 'MOGUL', 'MOIST', 'MOLAR', 'MOLDY', 'MONEY', 'MONTH',
  'MOODY', 'MOOSE', 'MORAL', 'MORON', 'MORPH', 'MOSSY', 'MOTEL', 'MOTH',
  'MOTIF', 'MOTOR', 'MOTTO', 'MOULT', 'MOUND', 'MOUNT', 'MOURN', 'MOUSE',
  'MOUTH', 'MOVER', 'MOVIE', 'MOWER', 'MUCKY', 'MUCUS', 'MUDDY', 'MULCH',
  'MUMMY', 'MUNCH', 'MURAL', 'MURKY', 'MUSHY', 'MUSIC', 'MUSKY', 'MUSTY',
  'MYRRH', 'NADIR', 'NAIVE', 'NANNY', 'NASAL', 'NASTY', 'NATAL', 'NAVAL',
  'NAVEL', 'NEEDY', 'NEIGH', 'NERDY', 'NERVE', 'NEVER', 'NEWER', 'NEWLY',
  'NICER', 'NICHE', 'NIECE', 'NIGHT', 'NINJA', 'NINNY', 'NINTH', 'NOBLE',
  'NOBLY', 'NOISE', 'NOISY', 'NOMAD', 'NOOSE', 'NORTH', 'NOSEY', 'NOTCH',
  'NOVEL', 'NUDGE', 'NURSE', 'NUTTY', 'NYMPH', 'OAKEN', 'OBESE', 'OCCUR',
  'OCEAN', 'OCTAL', 'OCTET', 'ODDER', 'ODDLY', 'OFFAL', 'OFFER', 'OFTEN',
  'OLDEN', 'OLDER', 'OLIVE', 'OMBRE', 'OMEGA', 'ONION', 'ONSET', 'OPERA',
  'OPINE', 'OPIUM', 'OPTIC', 'ORBIT', 'ORDER', 'ORGAN', 'OTHER', 'OTTER',
  'OUGHT', 'OUNCE', 'OUTDO', 'OUTER', 'OUTGO', 'OVARY', 'OVATE', 'OVERT',
  'OVINE', 'OVOID', 'OWING', 'OWNER', 'OXIDE', 'OZONE', 'PADDY', 'PAGAN',
  'PAINT', 'PALER', 'PALSY', 'PANEL', 'PANIC', 'PANSY', 'PAPAL', 'PAPER',
  'PARER', 'PARKA', 'PARRY', 'PARSE', 'PARTY', 'PASTA', 'PASTE', 'PASTY',
  'PATCH', 'PATIO', 'PATSY', 'PATTY', 'PAUSE', 'PAYEE', 'PAYER', 'PEACE',
  'PEACH', 'PEARL', 'PECAN', 'PEDAL', 'PENAL', 'PENCE', 'PENNE', 'PENNY',
  'PERCH', 'PERIL', 'PERKY', 'PESKY', 'PESTO', 'PETAL', 'PETTY', 'PHASE',
  'PHONE', 'PHONY', 'PHOTO', 'PIANO', 'PICKY', 'PIECE', 'PIETY', 'PIGGY',
  'PILOT', 'PINCH', 'PINEY', 'PINKY', 'PIOUS', 'PIPER', 'PIQUE', 'PITCH',
  'PITHY', 'PIVOT', 'PIXEL', 'PIXIE', 'PIZZA', 'PLACE', 'PLAID', 'PLAIN',
  'PLAIT', 'PLANE', 'PLANK', 'PLANT', 'PLATE', 'PLAZA', 'PLEAT', 'PLIED',
  'PLIER', 'PLUCK', 'PLUMB', 'PLUME', 'PLUMP', 'PLUNK', 'PLUSH', 'POESY',
  'POINT', 'POISE', 'POKER', 'POLAR', 'POLKA', 'POLYP', 'POOCH', 'POPPY',
  'PORCH', 'POSER', 'POSIT', 'POSSE', 'POUCH', 'POUND', 'POUTY', 'POWER',
  'PRANK', 'PRAWN', 'PREEN', 'PRESS', 'PRICE', 'PRICK', 'PRIDE', 'PRIED',
  'PRIME', 'PRIMO', 'PRINT', 'PRIOR', 'PRISM', 'PRIVY', 'PRIZE', 'PROBE',
  'PRONE', 'PRONG', 'PROOF', 'PROSE', 'PROUD', 'PROVE', 'PROWL', 'PROXY',
  'PRUDE', 'PRUNE', 'PSALM', 'PUBIC', 'PUDGY', 'PUFFY', 'PULPY', 'PULSE',
  'PUNCH', 'PUPIL', 'PUPPY', 'PUREE', 'PURGE', 'PURSE', 'PUSHY', 'PUTTY',
  'PYGMY', 'QUACK', 'QUAIL', 'QUAKE', 'QUALM', 'QUARK', 'QUART', 'QUASH',
  'QUASI', 'QUEEN', 'QUEER', 'QUELL', 'QUERY', 'QUEST', 'QUEUE', 'QUICK',
  'QUIET', 'QUILL', 'QUILT', 'QUIRK', 'QUITE', 'QUOTA', 'QUOTE', 'QUOTH',
  'RABBI', 'RABID', 'RACER', 'RADAR', 'RADII', 'RADIO', 'RAINY', 'RAISE',
  'RAJAH', 'RALLY', 'RAMEN', 'RANCH', 'RANDY', 'RANGE', 'RAPID', 'RARER',
  'RASPY', 'RATIO', 'RATTY', 'RAVEN', 'RAYON', 'RAZOR', 'REACH', 'REACT',
  'READY', 'REALM', 'REARM', 'REBAR', 'REBEL', 'REBUS', 'REBUT', 'RECAP',
  'RECUR', 'RECUT', 'REEDY', 'REFER', 'REFIT', 'REGAL', 'REHAB', 'REIGN',
  'RELAX', 'RELAY', 'RELIC', 'REMIT', 'RENAL', 'RENEW', 'REPAY', 'REPEL',
  'REPLY', 'RERUN', 'RESET', 'RESIN', 'RETCH', 'RETRO', 'RETRY', 'REUSE',
  'REVEL', 'REVUE', 'RHEUM', 'RHINO', 'RHYME', 'RIDER', 'RIDGE', 'RIFLE',
  'RIGHT', 'RIGID', 'RILED', 'RINSE', 'RIPEN', 'RISEN', 'RISER', 'RISKY',
  'RIVAL', 'RIVER', 'RIVET', 'ROACH', 'ROAST', 'ROBIN', 'ROBOT', 'ROCKY',
  'RODEO', 'ROGER', 'ROGUE', 'ROOMY', 'ROOST', 'ROTOR', 'ROUGE', 'ROUGH',
  'ROUND', 'ROUSE', 'ROUTE', 'ROVER', 'ROWDY', 'ROWER', 'ROYAL', 'RUDDY',
  'RUDER', 'RUGBY', 'RULER', 'RUMBA', 'RUMOR', 'RUPEE', 'RURAL', 'RUSTY',
  'SADLY', 'SAFER', 'SAINT', 'SALAD', 'SALLY', 'SALON', 'SALSA', 'SALTY',
  'SALVE', 'SALVO', 'SANDY', 'SANER', 'SAPPY', 'SASSY', 'SATIN', 'SATYR',
  'SAUCE', 'SAUCY', 'SAUNA', 'SAUTE', 'SAVOR', 'SAVOY', 'SAVVY', 'SCALD',
  'SCALE', 'SCALP', 'SCALY', 'SCAMP', 'SCANT', 'SCARE', 'SCARF', 'SCARY',
  'SCENE', 'SCENT', 'SCION', 'SCOFF', 'SCOLD', 'SCONE', 'SCOOP', 'SCOPE',
  'SCORE', 'SCORN', 'SCOUR', 'SCOUT', 'SCOWL', 'SCRAM', 'SCRAP', 'SCREE',
  'SCREW', 'SCRUB', 'SCRUM', 'SCUBA', 'SEDAN', 'SEEDY', 'SEGUE', 'SEIZE',
  'SEMIS', 'SENSE', 'SEPIA', 'SEPTA', 'SERIF', 'SERVE', 'SETUP', 'SEVEN',
  'SEVER', 'SEWER', 'SHACK', 'SHADE', 'SHADY', 'SHAFT', 'SHAKE', 'SHAKY',
  'SHALE', 'SHALL', 'SHALT', 'SHAME', 'SHANK', 'SHAPE', 'SHARD', 'SHARE',
  'SHARK', 'SHARP', 'SHAVE', 'SHAWL', 'SHEAR', 'SHEEN', 'SHEEP', 'SHEER',
  'SHEET', 'SHEIK', 'SHELF', 'SHELL', 'SHIED', 'SHIFT', 'SHINE', 'SHINY',
  'SHIRE', 'SHIRK', 'SHIRT', 'SHOAL', 'SHOCK', 'SHONE', 'SHOOK', 'SHOOT',
  'SHORE', 'SHORN', 'SHORT', 'SHOUT', 'SHOVE', 'SHOWN', 'SHOWY', 'SHRED',
  'SHREW', 'SHRUB', 'SHRUG', 'SHUCK', 'SHUNT', 'SHUSH', 'SHYLY', 'SIEGE',
  'SIEVE', 'SIGHT', 'SIGMA', 'SILKY', 'SILLY', 'SINCE', 'SINEW', 'SINGE',
  'SIREN', 'SISSY', 'SIXTH', 'SIXTY', 'SKATE', 'SKIER', 'SKIFF', 'SKILL',
  'SKIMP', 'SKIRT', 'SKULK', 'SKULL', 'SKUNK', 'SLACK', 'SLAIN', 'SLANG',
  'SLANT', 'SLASH', 'SLATE', 'SLAVE', 'SLEEK', 'SLEEP', 'SLEET', 'SLEPT',
  'SLICE', 'SLICK', 'SLIDE', 'SLIME', 'SLIMY', 'SLING', 'SLINK', 'SLOOP',
  'SLOPE', 'SLOSH', 'SLOTH', 'SLUMP', 'SLUNG', 'SLUNK', 'SLURP', 'SLUSH',
  'SLYLY', 'SMACK', 'SMALL', 'SMART', 'SMASH', 'SMEAR', 'SMELL', 'SMELT',
  'SMILE', 'SMIRK', 'SMITE', 'SMITH', 'SMOCK', 'SMOKE', 'SMOKY', 'SMOTE',
  'SNACK', 'SNAIL', 'SNAKE', 'SNAKY', 'SNARE', 'SNARL', 'SNEAK', 'SNEER',
  'SNIDE', 'SNIPE', 'SNOOP', 'SNORE', 'SNORT', 'SNOUT', 'SNOWY', 'SNUCK',
  'SNUFF', 'SOAPY', 'SOBER', 'SOGGY', 'SOLAR', 'SOLID', 'SOLVE', 'SONAR',
  'SONIC', 'SOOTY', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPADE', 'SPANK',
  'SPARE', 'SPARK', 'SPASM', 'SPAWN', 'SPEAK', 'SPEAR', 'SPECK', 'SPEND',
  'SPENT', 'SPERM', 'SPICE', 'SPICY', 'SPIED', 'SPIEL', 'SPIKE', 'SPIKY',
  'SPILL', 'SPINE', 'SPINY', 'SPIRE', 'SPITE', 'SPLAT', 'SPLIT', 'SPOIL',
  'SPOKE', 'SPOOF', 'SPOOK', 'SPOOL', 'SPOON', 'SPORE', 'SPORT', 'SPOUT',
  'SPRAY', 'SPREE', 'SPRIG', 'SPUNK', 'SPURN', 'SPURT', 'SQUAD', 'SQUAT',
  'SQUIB', 'STACK', 'STAFF', 'STAGE', 'STAID', 'STAIN', 'STAIR', 'STAKE',
  'STALE', 'STALK', 'STALL', 'STAMP', 'STAND', 'STANK', 'STARE', 'STARK',
  'START', 'STASH', 'STATE', 'STAVE', 'STEAD', 'STEAK', 'STEAM', 'STEED',
  'STEEL', 'STEEP', 'STEER', 'STEIN', 'STERN', 'STICK', 'STIFF', 'STILL',
  'STILT', 'STING', 'STINK', 'STINT', 'STOCK', 'STOIC', 'STOKE', 'STOLE',
  'STOMP', 'STONE', 'STONY', 'STOOD', 'STOOL', 'STOOP', 'STORE', 'STORK',
  'STORM', 'STORY', 'STOUT', 'STOVE', 'STRAP', 'STRAW', 'STRAY', 'STREW',
  'STRIP', 'STRUM', 'STRUT', 'STUCK', 'STUDY', 'STUFF', 'STUMP', 'STUNG',
  'STUNK', 'STUNT', 'STYLE', 'SUAVE', 'SUGAR', 'SUING', 'SUITE', 'SULKY',
  'SUNNY', 'SUPER', 'SURER', 'SURGE', 'SURLY', 'SUSHI', 'SWAMI', 'SWAMP',
  'SWARM', 'SWASH', 'SWATH', 'SWEAR', 'SWEAT', 'SWEEP', 'SWEET', 'SWELL',
  'SWEPT', 'SWIFT', 'SWILL', 'SWINE', 'SWING', 'SWIPE', 'SWIRL', 'SWISH',
  'SWORE', 'SWORN', 'SWUNG', 'SYNOD', 'SYRUP', 'TABBY', 'TABLE', 'TABOO',
  'TACIT', 'TACKY', 'TAFFY', 'TAINT', 'TAKEN', 'TAKER', 'TALLY', 'TALON',
  'TAMER', 'TANGO', 'TANGY', 'TAPER', 'TAPIR', 'TARDY', 'TAROT', 'TASTE',
  'TASTY', 'TATTY', 'TAUNT', 'TAWNY', 'TEACH', 'TEARY', 'TEASE', 'TEDDY',
  'TEETH', 'TEMPO', 'TEMPT', 'TENET', 'TENOR', 'TENSE', 'TENTH', 'TEPEE',
  'TEPID', 'TERMS', 'TERRA', 'TERSE', 'TESTY', 'THANK', 'THEFT', 'THEIR',
  'THEME', 'THERE', 'THESE', 'THETA', 'THICK', 'THIEF', 'THIGH', 'THING',
  'THINK', 'THIRD', 'THONG', 'THORN', 'THOSE', 'THREE', 'THREW', 'THROB',
  'THROW', 'THRUM', 'THUMB', 'THUMP', 'THYME', 'TIARA', 'TIBIA', 'TIDAL',
  'TIGER', 'TIGHT', 'TILDE', 'TIMER', 'TIMID', 'TIPSY', 'TITAN', 'TITHE',
  'TITLE', 'TOAST', 'TODAY', 'TODDY', 'TOKEN', 'TONAL', 'TONGA', 'TONIC',
  'TOOTH', 'TOPAZ', 'TOPIC', 'TORCH', 'TORSO', 'TORUS', 'TOTAL', 'TOTEM',
  'TOUCH', 'TOUGH', 'TOWEL', 'TOWER', 'TOXIC', 'TOXIN', 'TRACE', 'TRACK',
  'TRACT', 'TRADE', 'TRAIL', 'TRAIN', 'TRAIT', 'TRAMP', 'TRASH', 'TRAWL',
  'TREAD', 'TREAT', 'TREND', 'TRIAD', 'TRIAL', 'TRIBE', 'TRICE', 'TRICK',
  'TRIED', 'TRIES', 'TRIPE', 'TRITE', 'TROLL', 'TROOP', 'TROPE', 'TROUT',
  'TROVE', 'TRUCE', 'TRUCK', 'TRULY', 'TRUMP', 'TRUNK', 'TRUSS', 'TRUST',
  'TRUTH', 'TRYST', 'TUBAL', 'TUBER', 'TUFTY', 'TULIP', 'TULLE', 'TUMID',
  'TUMMY', 'TUMOR', 'TUNIC', 'TURBO', 'TUTOR', 'TWANG', 'TWEAK', 'TWEED',
  'TWEET', 'TWICE', 'TWINE', 'TWIRL', 'TWIST', 'TWIXT', 'TYING', 'UDDER',
  'ULCER', 'ULTRA', 'UMBRA', 'UNCLE', 'UNCUT', 'UNDER', 'UNDID', 'UNDUE',
  'UNFED', 'UNFIT', 'UNIFY', 'UNION', 'UNITE', 'UNITY', 'UNLIT', 'UNMET',
  'UNSET', 'UNTIE', 'UNTIL', 'UNZIP', 'UPPER', 'UPSET', 'URBAN', 'URINE',
  'USAGE', 'USHER', 'USING', 'USUAL', 'USURP', 'UTTER', 'VAGUE', 'VALET',
  'VALID', 'VALOR', 'VALUE', 'VALVE', 'VAPID', 'VAPOR', 'VAULT', 'VAUNT',
  'VEGAN', 'VENOM', 'VENUE', 'VERGE', 'VERSE', 'VERVE', 'VEXED', 'VICAR',
  'VIDEO', 'VIGIL', 'VIGOR', 'VILER', 'VILLA', 'VINYL', 'VIPER', 'VIRUS',
  'VISIT', 'VISOR', 'VISTA', 'VITAL', 'VIVID', 'VIXEN', 'VOCAL', 'VODKA',
  'VOGUE', 'VOICE', 'VOILA', 'VOMIT', 'VOTER', 'VOUCH', 'VOWEL', 'VYING',
  'WACKY', 'WAFER', 'WAGER', 'WAGON', 'WAIST', 'WAIVE', 'WALTZ', 'WARTY',
  'WASTE', 'WATCH', 'WATER', 'WAVER', 'WAXEN', 'WEARY', 'WEAVE', 'WEDGE',
  'WEEDY', 'WEIGH', 'WEIRD', 'WELCH', 'WELSH', 'WHACK', 'WHALE', 'WHARF',
  'WHEAT', 'WHEEL', 'WHELP', 'WHERE', 'WHICH', 'WHIFF', 'WHILE', 'WHINE',
  'WHINY', 'WHIRL', 'WHISK', 'WHITE', 'WHOLE', 'WHOOP', 'WHOSE', 'WIDEN',
  'WIDER', 'WIDOW', 'WIDTH', 'WIELD', 'WIGHT', 'WILLY', 'WIMPY', 'WINCE',
  'WINCH', 'WINDY', 'WINGS', 'WIRED', 'WISER', 'WISPY', 'WITCH', 'WITTY',
  'WOKEN', 'WOMAN', 'WOMEN', 'WOOED', 'WOOER', 'WOOLY', 'WOOZY', 'WORDY',
  'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WOVEN',
  'WRACK', 'WRATH', 'WREAK', 'WRECK', 'WREST', 'WRING', 'WRIST', 'WRITE',
  'WRITS', 'WRONG', 'WROTE', 'WRUNG', 'WRYLY', 'YACHT', 'YEARN', 'YEAST',
  'YIELD', 'YODEL', 'YOGIC', 'YOKEL', 'YOUNG', 'YOUTH', 'ZEBRA', 'ZEROS',
  'ZESTY', 'ZONAL',
];

// Combined valid list (Set for O(1) lookup)
export const VALID_WORDS = new Set([...ANSWERS, ...VALID_EXTRA]);

/* --------------------------------------------------------------------------
 * Day index — number of days elapsed since LAUNCH_DATE, computed in
 * America/Chicago time so a player in NOLA at 11pm and one in LA at
 * 8pm get the same puzzle.
 * -------------------------------------------------------------------------- */
export function getDayIndex(now = new Date()) {
  const today = chicagoYMD(now);
  const launch = LAUNCH_DATE;
  const diffMs = ymdToUtc(today) - ymdToUtc(launch);
  return Math.max(0, Math.floor(diffMs / 86400000));
}

/** Return today's puzzle word for the current Chicago date. */
export function getTodaysWord(now = new Date()) {
  const idx = getDayIndex(now);
  return ANSWERS[idx % ANSWERS.length];
}

/** Number of milliseconds until the next Chicago midnight. */
export function msUntilNextPuzzle(now = new Date()) {
  // Build a Date object representing midnight tomorrow in Chicago time
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  // Chicago "wall time" right now:
  const wallNow = new Date(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`);
  // Tomorrow midnight in Chicago wall time:
  const wallMidnight = new Date(wallNow);
  wallMidnight.setHours(24, 0, 0, 0);
  // Diff is the same regardless of timezone interpretation, since both
  // are interpreted as the same local time.
  return wallMidnight - wallNow;
}

/* -------- internal -------- */

/** Return current date as YYYY-MM-DD in America/Chicago. */
function chicagoYMD(date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(date); // en-CA produces YYYY-MM-DD
}

/** Convert YYYY-MM-DD to a UTC millisecond timestamp (noon UTC to avoid DST edges). */
function ymdToUtc(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 12, 0, 0);
}
