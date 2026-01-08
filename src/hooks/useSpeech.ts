import { useState, useEffect, useCallback } from 'react';

export function useSpeech() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);

    useEffect(() => {
        const updateVoices = () => {
            const available = window.speechSynthesis.getVoices();
            setVoices(available);
            // Try to pick a default English voice
            if (!selectedVoice) {
                const defaultVoice = available.find(v => v.lang.startsWith('en-US')) || available[0];
                setSelectedVoice(defaultVoice || null);
            }
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    const speak = useCallback((text: string) => {
        if (!text) return;

        // Cancel previous
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;

        window.speechSynthesis.speak(utterance);
    }, [selectedVoice, rate, pitch]);

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        rate,
        setRate,
        pitch,
        setPitch,
        speak
    };
}
