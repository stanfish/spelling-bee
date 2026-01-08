export default function Header({
    currentView,
    setView
}: {
    currentView: 'study' | 'manage';
    setView: (v: 'study' | 'manage') => void
}) {
    return (
        <header className="flex w-full items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                    B
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Spelling Bee
                </h1>
            </div>

            <nav className="flex gap-4">
                <button
                    onClick={() => setView('study')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${currentView === 'study'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                >
                    Study
                </button>
                <button
                    onClick={() => setView('manage')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${currentView === 'manage'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                >
                    Word List
                </button>
            </nav>
        </header>
    );
}
