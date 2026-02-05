import { useState, useEffect, useCallback } from 'react';

export interface WordStats {
    word: string;
    incorrectCount: number;
    totalAttempts: number;
    averageTime?: number; // in milliseconds
    history: boolean[]; // true = correct, false = incorrect (track last 10)
}

const DEFAULT_WORDS = [
    "acrobat", "Adriatic", "ahead", "ahoy", "ajar", "albatross", "alfalfa", "almanac",
    "amicable", "ancestral", "anguish", "anonymously", "answer", "apocalypse",
    "appointment", "archipelago", "aristocracy", "aroma", "artifacts", "asphalt",
    "asleep", "assignment", "atrium", "attacked", "Aubusson", "au revoir",
    "auxiliary", "avocado", "awkward", "baffling", "bait", "baklava", "barricade",
    "barrette", "basil", "baskets", "battlements", "bayonet", "beautician", "before",
    "begrudge", "beige", "belfry", "Berlin", "billowed", "blossoms", "boll weevil",
    "bombarded", "boulangerie", "boutique", "bracken", "brandished", "breakfast",
    "brilliant", "bronchitis", "brown", "bucket", "Buffalo", "bulletin", "burpees",
    "bursitis", "cadre", "cajolery", "camphor", "campaign", "candy", "cannelloni",
    "careened", "cartwheel", "cavorting", "chandelier", "chance", "Charolais",
    "chartreuse", "chassis", "chignon", "chimneys", "chlorine", "chocolate",
    "circus", "close", "cluster", "colossus", "commotion", "compassionate",
    "compunction", "comrades", "comfy", "concierge", "confreres", "conical",
    "conjure", "conscience", "contentious", "convulsively", "corbels", "coral",
    "cosmetics", "countess", "courier", "courtyard", "cozy", "crawdad", "cravenly",
    "crematorium", "crowd", "curious", "cycads", "cylinders", "dangerous", "deck",
    "deferential", "deflated", "delphine", "democracy", "depots", "dexterity",
    "dignitaries", "dimensional", "dinosaur", "diphtheria", "dirge", "disability",
    "discipline", "discoveries", "dismissal", "dissolving", "distress", "dollop",
    "draw", "dubious", "dulce", "eaten", "ebony", "eccentric", "elephant",
    "emphatically", "emporium", "encourages", "enormous", "ensemble",
    "enthusiastic", "equations", "equestrian", "Erie", "especially", "et cetera",
    "Everest", "exuberant", "fabulous", "faint", "faraway", "farmer", "February",
    "fiberglass", "fish", "fissures", "fluently", "focus", "foreign", "forepaw",
    "foreseeable", "forest", "formation", "formidable", "fraidycat", "fragments",
    "Frankenstein", "fräulein", "fruit", "frustration", "fugitive", "galleon",
    "gallop", "galore", "gangly", "garbage", "garbled", "garishly", "gaunt",
    "geranium", "giant", "gingham", "gleaned", "goats", "gorgeous", "graffitist",
    "grimace", "gusto", "guttural", "gyroplane", "heater", "hedgehog", "heron",
    "hesitate", "hibiscus", "hippies", "hockey", "hoist", "hold", "hollow",
    "hors d'oeuvres", "hyperventilated", "hypnosis", "hypocritical", "imitation",
    "immigrants", "incredible", "insects", "invincible", "jangle", "jeered",
    "journey", "junket", "khaki", "Kilimanjaro", "kitchen", "lacrosse", "language",
    "lanky", "lanyards", "lasagna", "latticework", "leaning", "leather", "lessons",
    "lilt", "limbs", "lo mein", "lure", "lurches", "lunacy", "lye", "magnanimous",
    "maître d'", "mango", "manticores", "maquisards", "maracas", "marauder",
    "marquee", "mascot", "melon", "memoirs", "mercantile", "mermaid", "message",
    "milk", "mind", "miniature", "minnows", "misanthrope", "moment", "monsoon",
    "monsieur", "mosque", "moustache", "muffler", "mulberry", "mysterious",
    "nautical", "Nehru", "neon", "nervous", "noggin", "nomad", "nomination",
    "oblivion", "officially", "ominous", "onslaught", "opalescent", "opportunist",
    "ostracism", "Oswego", "paltry", "paparazzi", "parachute", "parchment",
    "parent", "paste", "pâtisserie", "patriarchs", "pediatric", "peppercorn",
    "perfume", "peroxide", "pheromone", "piccolo", "pinioning", "pirates",
    "pistachio", "pizzeria", "plaid", "plaited", "plausible", "pogrom", "pond",
    "porridge", "prattling", "preamble", "precocious", "premises", "prestigious",
    "proficient", "prognosis", "promenade", "propaganda", "prototype", "protégé",
    "psyche", "puissance", "pumpernickel", "quandary", "quilt", "raise", "rakish",
    "ramshackle", "ratify", "ration", "receipts", "receptionist", "recipe",
    "reclusive", "remind", "renowned", "reprimanding", "repugnant", "residuals",
    "rickety", "riveted", "roam", "rotunda", "ruby", "ruefully", "rummage",
    "safari", "salvaged", "samosas", "sans serif", "sarape", "sardines", "satin",
    "savant", "scavenger", "schema", "scorcher", "scrub", "scrunch", "scurrying",
    "seep", "send", "señor", "sequins", "sharks", "shimmer", "shortcut", "shouting",
    "shuffle", "signal", "silhouette", "silver", "sinister", "sizzling", "skater",
    "skewer", "skirt", "skittish", "slime", "slough", "sluice", "snug", "solemnly",
    "spectators", "spinning", "sporadic", "squalor", "stay", "steeple",
    "streetlights", "stretch", "stucco", "stuck", "studded", "substantially",
    "sugar", "surprise", "suspicious", "swaggering", "swampy", "sweet",
    "syndrome", "tackle", "taffy", "tag", "tail", "talcum", "tamale", "tank",
    "teeth", "tender", "thesaurus", "tight", "tint", "toiletries", "tranquilizer",
    "traumatic", "trebuchets", "triple", "tuberculosis", "tulle", "turnout",
    "tuxedo", "twigs", "ultimatum", "unfamiliar", "unicorn", "unleash",
    "unparalleled", "unruly", "understand", "vacuum", "valentine", "verdict",
    "vidimus", "vigilance", "wainscoting", "want", "warlock", "weather", "wheels",
    "whinnying", "whittled", "window", "winsome", "wire", "wooden", "woozy",
    "writing", "yawn", "Yiddish", "zeal", "zombielike", "zooming"
];

// const DEFAULT_WORDS = [
//     "albatross", "almanac", "ancestral", "anguish", "archipelago", "aroma", "artifacts",
//     "asphalt", "atrium", "battlements", "beige", "Berlin", "billowed", "bracken",
//     "brandished", "Buffalo", "campaign", "cavorting", "chartreuse", "chignon",
//     "colossus", "commotion", "conical", "conjure", "conscience", "convulsively",
//     "cosmetics", "courier", "crawdad", "deferential", "deflated", "delphine",
//     "democracy", "dexterity", "dimensional", "discoveries", "dissolving", "dubious",
//     "ebony", "eccentric", "emporium", "encourages", "enormous", "equestrian",
//     "et cetera", "Everest", "fabulous", "fluently", "foreign", "fragments",
//     "fraidycat", "Frankenstein", "frustration", "fugitive", "galleon", "gallop",
//     "galore", "garbled", "garishly", "gaunt", "geranium", "gleaned", "graffitist",
//     "grimace", "gusto", "guttural", "heron", "hesitate", "hippies", "hypnosis",
//     "imitation", "immigrants", "jeered", "khaki", "language", "lanky", "lanyards",
//     "lilt", "lo mein", "lunacy", "lurches", "magnanimous", "manticores", "marauder",
//     "mascot", "miniature", "monsieur", "mosque", "moustache", "mysterious",
//     "nautical", "Nehru", "neon", "noggin", "nomad", "oblivion", "opalescent",
//     "paltry", "parchment", "pediatric", "perfume", "pheromone", "pinioning",
//     "pistachio", "plaited", "plausible", "porridge", "prattling", "preamble",
//     "prestigious", "prognosis", "psyche", "puissance", "rakish", "ramshackle",
//     "ration", "receptionist", "reprimanding", "rickety", "rotunda", "rummage",
//     "samosas", "sans serif", "sardines", "savant", "scavenger", "schema",
//     "scorcher", "sequins", "serape", "sinister", "skewer", "slough", "spectators",
//     "steeple", "stucco", "suspicious", "talcum", "toiletries", "tranquilizer",
//     "tuxedo", "unleash", "unruly", "verdict", "vidimus", "wainscoting", "warlock",
//     "winsome", "Yiddish", "zombielike"
// ];

// const DEFAULT_WORDS = [
//     "verdict", "imitation", "preamble", "commotion", "steeple", "suspicious", "fugitive", "nomad", "Berlin", "bracken", "rakish", "gusto", "jeered", "galore", "eccentric", "hippies", "pistachio",
//     "garbled", "miniature", "plausible", "oblivion", "spectators", "parchment", "heron", "billowed", "lunacy", "noggin", "hypnosis", "toiletries", "winsome", "emporium", "savant", "samosas", "mosque",
//     "encourages", "receptionist", "reprimanding", "immigrants", "lanyards", "ramshackle", "dissolving", "skewer", "conjure", "neon", "rotunda", "gleaned", "prattling", "atrium", "almanac", "campaign"
// ];

const STORAGE_KEY = 'spelling-bee-words';

export function useWordStore() {
    const [words, setWords] = useState<WordStats[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage or seed defaults
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setWords(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse words from local storage", e);
                seedDefaults();
            }
        } else {
            seedDefaults();
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage whenever words change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
        }
    }, [words, isLoaded]);

    const seedDefaults = useCallback(() => {
        const initialWords = DEFAULT_WORDS.map(word => ({
            word,
            incorrectCount: 0,
            totalAttempts: 0,
            averageTime: 0,
            history: []
        }));
        setWords(initialWords);
    }, []);

    const addWord = useCallback((newWord: string) => {
        const trimmed = newWord.trim();
        if (!trimmed) return;

        setWords(prev => {
            if (prev.some(w => w.word.toLowerCase() === trimmed.toLowerCase())) return prev;
            return [...prev, {
                word: trimmed,
                incorrectCount: 0,
                totalAttempts: 0,
                averageTime: 0,
                history: []
            }];
        });
    }, []);

    const deleteWord = useCallback((wordToDelete: string) => {
        setWords(prev => prev.filter(w => w.word !== wordToDelete));
    }, []);

    const updateWordResult = useCallback((targetWord: string, isCorrect: boolean, timeSpentMs: number = 0) => {
        setWords(prev => prev.map(w => {
            if (w.word !== targetWord) return w;

            const newHistory = [...w.history, isCorrect].slice(-10); // Keep last 10

            // Calculate new average time
            // Formula: ((oldAvg * oldTotal) + newTime) / newTotal
            const currentAvg = w.averageTime || 0;
            const newTotalAttempts = w.totalAttempts + 1;
            const newAverageTime = ((currentAvg * w.totalAttempts) + timeSpentMs) / newTotalAttempts;

            return {
                ...w,
                totalAttempts: newTotalAttempts,
                incorrectCount: isCorrect ? w.incorrectCount : w.incorrectCount + 1,
                averageTime: newAverageTime,
                history: newHistory
            };
        }));
    }, []);

    const getWeightedRandomWord = useCallback(() => {
        if (words.length === 0) return null;

        let totalWeight = 0;
        const wordWeights: { word: string; weight: number }[] = [];

        words.forEach(w => {
            let correctRate = 0.33; // Default assumption for 0 attempts

            if (w.totalAttempts > 0) {
                correctRate = (w.totalAttempts - w.incorrectCount) / w.totalAttempts;
            }

            // Weight is inverse of correct rate (lower rate = higher weight)
            // Add small buffer to avoid division by zero if we used 1/rate, 
            // but here we use 1 / (rate + 0.1) to create a nice curve.
            // 0% correct -> 1 / 0.1 = 10
            // 33% correct -> 1 / 0.43 = ~2.3
            // 100% correct -> 1 / 1.1 = ~0.9
            const weight = 1 / (correctRate + 0.1);

            wordWeights.push({ word: w.word, weight });
            totalWeight += weight;
        });

        const randomValue = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (const { word, weight } of wordWeights) {
            cumulativeWeight += weight;
            if (randomValue <= cumulativeWeight) {
                return word;
            }
        }

        // Fallback (should rarely reach here unless rounding errors)
        return wordWeights[wordWeights.length - 1].word;
    }, [words]);

    const checkForNewWords = useCallback(() => {
        let addedCount = 0;
        setWords(prev => {
            const existingWordsSet = new Set(prev.map(w => w.word.toLowerCase()));
            const newWords: WordStats[] = [];

            DEFAULT_WORDS.forEach(defaultWord => {
                if (!existingWordsSet.has(defaultWord.toLowerCase())) {
                    newWords.push({
                        word: defaultWord,
                        incorrectCount: 0,
                        totalAttempts: 0,
                        averageTime: 0,
                        history: []
                    });
                }
            });

            if (newWords.length > 0) {
                addedCount = newWords.length;
                return [...prev, ...newWords];
            }
            return prev;
        });
        return addedCount; // Note: This return value won't be accessible immediately if used inside setWords helper due to closure, 
        // but we can calculate it before setting state if we want to return it.
        // Actually, setWords is async-like. To return the count, we need to calculate it outside setWords 
        // or use a different pattern. Let's calculate based on current 'words' state dependencies 
        // but 'words' might be stale in a closure if not careful. 
        // However, for this button click, using the current state 'words' is fine as it's triggered by user.
    }, []);

    // We need a version that returns the number for the UI to show.
    // The state update pattern above is good for concurrency, but bad for returning the value.
    // Let's refactor slightly to separate calculation.
    const syncMissingDefaults = useCallback(() => {
        let count = 0;
        setWords(currentWords => {
            const existingWordsSet = new Set(currentWords.map(w => w.word.toLowerCase()));
            const wordsToAdd: WordStats[] = [];

            DEFAULT_WORDS.forEach(defaultWord => {
                if (!existingWordsSet.has(defaultWord.toLowerCase())) {
                    wordsToAdd.push({
                        word: defaultWord,
                        incorrectCount: 0,
                        totalAttempts: 0,
                        averageTime: 0,
                        history: []
                    });
                }
            });

            count = wordsToAdd.length;
            if (count > 0) {
                return [...currentWords, ...wordsToAdd];
            }
            return currentWords;
        });
        // We can't return 'count' from inside setWords. 
        // We will calculate it synchronously against the current state before setting.
        // This is safe enough for a manual trigger.
    }, []);

    const checkAndAddMissingWords = useCallback((): number => {
        // Calculate diff against current state 'words' (from closure scope)
        // Note: We need 'words' in the dependency array for this to work correctly.
        const existingWordsSet = new Set(words.map(w => w.word.toLowerCase()));
        const wordsToAdd: WordStats[] = [];

        DEFAULT_WORDS.forEach(defaultWord => {
            if (!existingWordsSet.has(defaultWord.toLowerCase())) {
                wordsToAdd.push({
                    word: defaultWord,
                    incorrectCount: 0,
                    totalAttempts: 0,
                    averageTime: 0,
                    history: []
                });
            }
        });

        if (wordsToAdd.length > 0) {
            setWords(prev => [...prev, ...wordsToAdd]);
        }

        return wordsToAdd.length;
    }, [words]);

    return {
        words,
        isLoaded,
        addWord,
        deleteWord,
        updateWordResult,
        getWeightedRandomWord,
        checkAndAddMissingWords,
        resetStats: seedDefaults
    };
}
