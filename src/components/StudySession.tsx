import { useState, useEffect, useRef, FormEvent } from 'react';
import { useWordStore } from '@/hooks/useWordStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useDictionary } from '@/hooks/useDictionary';

export default function StudySession() {
    const { getWeightedRandomWord, updateWordResult } = useWordStore();
    const { speak, voices, selectedVoice, setSelectedVoice, rate, setRate } = useSpeech();
    const { definition, fetchDefinition, isLoading: isDefLoading } = useDictionary();

    const [currentWord, setCurrentWord] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [hasStarted, setHasStarted] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const startTimeRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startSession = () => {
        setHasStarted(true);
        nextWord();
    };

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const nextWord = () => {
        const word = getWeightedRandomWord();
        if (word) {
            setCurrentWord(word);
            fetchDefinition(word);
            setInput('');
            setFeedback('idle');
            setElapsedTime(0);

            // Start timer
            startTimeRef.current = Date.now();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = setInterval(() => {
                if (startTimeRef.current) {
                    setElapsedTime(Date.now() - startTimeRef.current);
                }
            }, 100);

            // Small delay to ensure state update before speaking
            setTimeout(() => speak(word), 100);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();

        if (!currentWord) return;

        if (!input.trim()) {
            speak(currentWord);
            inputRef.current?.focus();
            return;
        }

        // If currently showing feedback, Enter key moves to next
        if (feedback !== 'idle') {
            nextWord();
            return;
        }

        // Validation
        const isCorrect = input.trim().toLowerCase() === currentWord.toLowerCase();

        // Stop timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        const finalTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

        setFeedback(isCorrect ? 'correct' : 'incorrect');
        updateWordResult(currentWord, isCorrect, finalTime);
    };

    if (!hasStarted) {
        return (
            <div className="w-full max-w-xl mx-auto p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-500 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Spell?</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Make sure your volume is up. We'll say a word, and you spell it out.
                    </p>
                </div>

                <button
                    onClick={startSession}
                    className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                >
                    Start Session
                </button>

                <div className="mt-8 text-sm text-gray-400">
                    {voices.length > 0 ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {voices.length} voices detected
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 text-red-400">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Loading voices...
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col items-center gap-8 animate-in fade-in duration-500">

            {/* Settings Row */}
            <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-xs text-gray-500 font-medium uppercase">Voice</label>
                    <select
                        className="flex-1 sm:w-48 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none outline-none cursor-pointer"
                        value={selectedVoice?.name || ''}
                        onChange={e => {
                            const v = voices.find(voice => voice.name === e.target.value);
                            if (v) setSelectedVoice(v);
                        }}
                    >
                        {voices.length === 0 && <option>Loading voices...</option>}
                        {voices.map(v => (
                            <option key={v.name} value={v.name}>{v.name.slice(0, 20)}...</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <label className="text-xs text-gray-500 font-medium uppercase">Speed</label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={e => setRate(parseFloat(e.target.value))}
                        className="flex-1 accent-yellow-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono w-8 text-right">{rate}x</span>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="w-full text-center py-12">
                <button
                    onClick={() => currentWord && speak(currentWord)}
                    className="mx-auto w-24 h-24 rounded-full bg-yellow-400 hover:bg-yellow-500 active:scale-95 transition-all shadow-xl flex items-center justify-center text-black mb-8 group"
                    title="Play Audio (or press Space)"
                >
                    <svg className="group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>

                <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        readOnly={feedback !== 'idle'}
                        onKeyDown={(e) => {
                            if (feedback !== 'idle' && e.key === 'Enter') {
                                e.preventDefault();
                                nextWord();
                            }
                        }}
                        placeholder="Type what you hear..."
                        className={`w-full text-center text-3xl font-bold p-4 bg-transparent border-b-4 outline-none transition-all placeholder:font-normal placeholder:text-gray-300 dark:placeholder:text-gray-700
              ${feedback === 'idle' ? 'border-gray-200 dark:border-gray-700 focus:border-yellow-400' : 'cursor-default focus:outline-none'}
              ${feedback === 'correct' ? 'border-green-500 text-green-600' : ''}
              ${feedback === 'incorrect' ? 'border-red-500 text-red-600' : ''}
            `}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />

                    <div className="absolute top-4 right-4 text-xs font-mono text-gray-400 pointer-events-none">
                        {(elapsedTime / 1000).toFixed(1)}s
                    </div>

                    <div className="min-h-[4rem] mt-6 flex flex-col items-center justify-center gap-4">
                        {feedback === 'idle' && (
                            <div className="text-gray-400 text-sm animate-pulse">Press Enter to check</div>
                        )}
                        {feedback !== 'idle' && (
                            <>
                                {feedback === 'correct' ? (
                                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                        <span className="text-green-500 font-bold text-xl">Correct!</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center animate-in shake duration-300">
                                        <span className="text-red-500 font-bold text-xl">Incorrect</span>
                                        <span className="text-gray-500 mt-1">Correct spelling: <strong className="text-gray-900 dark:text-gray-100">{currentWord}</strong></span>
                                    </div>
                                )}

                                {/* Definition Card */}
                                <div className="max-w-sm w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 my-4 border border-gray-100 dark:border-gray-800 text-left animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                            {currentWord}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            {definition?.partOfSpeech && (
                                                <span className="italic text-gray-500 dark:text-gray-400 font-medium">
                                                    {definition.partOfSpeech}
                                                </span>
                                            )}
                                            {definition?.phonetic && (
                                                <span className="font-mono text-gray-400">
                                                    {definition.phonetic}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isDefLoading ? (
                                        <div className="h-16 flex items-center justify-center text-sm text-gray-400 gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    ) : definition ? (
                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {definition.definition}
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">
                                            Definition not available.
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        nextWord();
                                    }}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2"
                                >
                                    Next Word <span className="text-xs opacity-50">↵</span>
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

        </div>
    );
}
