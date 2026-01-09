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

            // Try to restore from local storage
            const storedVoiceURI = localStorage.getItem('spelling-bee-voice');
            const storedRate = localStorage.getItem('spelling-bee-rate');

            if (storedRate) {
                setRate(parseFloat(storedRate));
            }

            let voiceToSet: SpeechSynthesisVoice | undefined;

            if (storedVoiceURI) {
                voiceToSet = available.find(v => v.voiceURI === storedVoiceURI);
            }

            // Fallback to default if no stored voice or stored voice not found
            if (!voiceToSet) {
                voiceToSet = available.find(v => v.lang.startsWith('en-US')) || available[0];
            }

            setSelectedVoice(voiceToSet || null);
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const handleSetVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
        setSelectedVoice(voice);
        if (voice) {
            localStorage.setItem('spelling-bee-voice', voice.voiceURI);
        } else {
            localStorage.removeItem('spelling-bee-voice');
        }
    }, []);

    const handleSetRate = useCallback((newRate: number) => {
        setRate(newRate);
        localStorage.setItem('spelling-bee-rate', newRate.toString());
    }, []);

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
        setSelectedVoice: handleSetVoice,
        rate,
        setRate: handleSetRate,
        pitch,
        setPitch,
        speak
    };
}
