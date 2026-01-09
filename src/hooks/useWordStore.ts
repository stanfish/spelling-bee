import { useState, useEffect, useCallback } from 'react';

export interface WordStats {
    word: string;
    incorrectCount: number;
    totalAttempts: number;
    averageTime?: number; // in milliseconds
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
