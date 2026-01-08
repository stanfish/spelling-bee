import { useState, useEffect, useCallback } from 'react';

export interface WordStats {
    word: string;
    incorrectCount: number;
    totalAttempts: number;
    history: boolean[]; // true = correct, false = incorrect (track last 10)
}

const DEFAULT_WORDS = [
    "verdict", "imitation", "preamble", "commotion", "steeple", "suspicious", "fugitive", "nomad", "Berlin", "bracken", "rakish", "gusto", "jeered", "galore", "eccentric", "hippies", "pistachio",
    "garbled", "miniature", "plausible", "oblivion", "spectators", "parchment", "heron", "billowed", "lunacy", "noggin", "hypnosis", "toiletries", "winsome", "emporium", "savant", "samosas", "mosque",
    "encourages", "receptionist", "reprimanding", "immigrants", "lanyards", "ramshackle", "dissolving", "skewer", "conjure", "neon", "rotunda", "gleaned", "prattling", "atrium", "almanac", "campaign"
];

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
                history: []
            }];
        });
    }, []);

    const deleteWord = useCallback((wordToDelete: string) => {
        setWords(prev => prev.filter(w => w.word !== wordToDelete));
    }, []);

    const updateWordResult = useCallback((targetWord: string, isCorrect: boolean) => {
        setWords(prev => prev.map(w => {
            if (w.word !== targetWord) return w;

            const newHistory = [...w.history, isCorrect].slice(-10); // Keep last 10
            return {
                ...w,
                totalAttempts: w.totalAttempts + 1,
                incorrectCount: isCorrect ? w.incorrectCount : w.incorrectCount + 1,
                history: newHistory
            };
        }));
    }, []);

    const getWeightedRandomWord = useCallback(() => {
        if (words.length === 0) return null;

        // Weight calculation: Base weight 1.
        // +2 for every recent error in history? 
        // Or just use incorrectCount?
        // User asked: "if user answers it wrong, make it more chance to pick it later"
        // Let's allow weight to scale with incorrectCount and recent failures.

        const weightedPool: string[] = [];

        words.forEach(w => {
            let weight = 1;
            // Add weight for total incorrects to bias towards historically hard words
            weight += w.incorrectCount * 2;

            // Add extra weight if largely wrong recently (last 3 attempts)
            const recentFailures = w.history.slice(-3).filter(h => !h).length;
            weight += recentFailures * 5;

            // Push word 'weight' times into the pool
            for (let i = 0; i < weight; i++) {
                weightedPool.push(w.word);
            }
        });

        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        return weightedPool[randomIndex];
    }, [words]);

    return {
        words,
        isLoaded,
        addWord,
        deleteWord,
        updateWordResult,
        getWeightedRandomWord,
        resetStats: seedDefaults
    };
}
