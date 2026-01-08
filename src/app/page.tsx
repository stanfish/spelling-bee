"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import StudySession from '@/components/StudySession';
import WordList from '@/components/WordList';

export default function Home() {
  const [view, setView] = useState<'study' | 'manage'>('study');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans selection:bg-yellow-200 selection:text-black">
      <Header currentView={view} setView={setView} />

      <main className="container mx-auto py-8 px-4">
        {view === 'study' ? (
          <StudySession />
        ) : (
          <WordList />
        )}
      </main>
    </div>
  );
}
