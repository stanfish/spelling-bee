import { useState, useMemo } from 'react';
import { useWordStore, WordStats } from '@/hooks/useWordStore';

type SortKey = 'word' | 'attempts' | 'correctRate';

export default function WordList() {
    const { words, addWord, deleteWord } = useWordStore();
    const [newWord, setNewWord] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'word', direction: 'asc' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWord.trim()) {
            addWord(newWord);
            setNewWord('');
        }
    };

    const getCorrectRateVal = (w: WordStats) => {
        if (w.totalAttempts === 0) return -1; // Treat no attempts as lowest rate
        return (w.totalAttempts - w.incorrectCount) / w.totalAttempts;
    };

    const calculateCorrectRate = (w: WordStats) => {
        if (w.totalAttempts === 0) return '-';
        return Math.round(getCorrectRateVal(w) * 100) + '%';
    };

    const sortedWords = useMemo(() => {
        const sorted = [...words];
        sorted.sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';

            switch (sortConfig.key) {
                case 'word':
                    valA = a.word.toLowerCase();
                    valB = b.word.toLowerCase();
                    break;
                case 'attempts':
                    valA = a.totalAttempts;
                    valB = b.totalAttempts;
                    break;
                case 'correctRate':
                    valA = getCorrectRateVal(a);
                    valB = getCorrectRateVal(b);
                    break;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [words, sortConfig]);

    const requestSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => {
        if (!active) return <span className="opacity-20 ml-1">⇅</span>;
        return <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Word Collection</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your study list and track performance.
                    </p>
                </div>

                <form onSubmit={handleAdd} className="flex w-full sm:w-auto relative">
                    <input
                        type="text"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Add a new word..."
                        className="w-full sm:w-64 pl-4 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newWord.trim()}
                        className="absolute right-2 top-2 p-1.5 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:hover:bg-yellow-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-900/50 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold select-none">
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => requestSort('word')}
                                >
                                    <div className="flex items-center">
                                        Word <SortIcon active={sortConfig.key === 'word'} direction={sortConfig.direction} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => requestSort('attempts')}
                                >
                                    <div className="flex items-center justify-center">
                                        Attempts <SortIcon active={sortConfig.key === 'attempts'} direction={sortConfig.direction} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => requestSort('correctRate')}
                                >
                                    <div className="flex items-center justify-center">
                                        Correct Rate <SortIcon active={sortConfig.key === 'correctRate'} direction={sortConfig.direction} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {sortedWords.map((w) => (
                                <tr key={w.word} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-lg">
                                        {w.word}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                            {w.totalAttempts}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${w.totalAttempts === 0
                                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                                                : (1 - w.incorrectCount / w.totalAttempts) >= 0.8
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {calculateCorrectRate(w)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteWord(w.word)}
                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                            title="Delete word"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {words.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                        No words yet. Add some to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
