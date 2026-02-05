import { useState, useCallback, useRef } from 'react';

interface DefinitionData {
    definition: string;
    partOfSpeech: string;
    phonetic?: string;
}

export function useDictionary() {
    const [definition, setDefinition] = useState<DefinitionData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track the last request to avoid race conditions
    const lastRequestRef = useRef<{ word: string } | null>(null);

    const fetchDefinition = useCallback(async (word: string) => {
        if (!word) return;

        const currentParams = { word };
        lastRequestRef.current = currentParams;

        setIsLoading(true);
        setError(null);
        setDefinition(null);

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

            // Check if this is still the most recent request
            if (lastRequestRef.current !== currentParams) return;

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Definition not found');
                } else {
                    setError('Failed to fetch definition');
                }
                return;
            }

            const data = await response.json();

            // Re-check after awaiting json
            if (lastRequestRef.current !== currentParams) return;

            if (data && data.length > 0) {
                // Try to find the first meaning with a definition
                const firstEntry = data[0];
                const phonetic = firstEntry.phonetic || firstEntry.phonetics?.find((p: any) => p.text)?.text;

                // Look for the first meaning that has definitions
                const meaning = firstEntry.meanings?.find((m: any) => m.definitions?.length > 0);

                if (meaning) {
                    setDefinition({
                        definition: meaning.definitions[0].definition,
                        partOfSpeech: meaning.partOfSpeech,
                        phonetic
                    });
                } else {
                    setError('No definition found');
                }
            } else {
                setError('No definition found');
            }
        } catch (err) {
            if (lastRequestRef.current === currentParams) {
                setError('Error connecting to dictionary service');
                console.error(err);
            }
        } finally {
            if (lastRequestRef.current === currentParams) {
                setIsLoading(false);
            }
        }
    }, []);

    const clearDefinition = useCallback(() => {
        setDefinition(null);
        setError(null);
        lastRequestRef.current = null;
    }, []);

    return {
        definition,
        isLoading,
        error,
        fetchDefinition,
        clearDefinition
    };
}
