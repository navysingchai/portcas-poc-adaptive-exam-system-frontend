'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import AIStatusBadge from '@/components/AIStatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchExamInfo, fetchAIStatus, startExam, AIStatus } from '@/lib/api';
import { setExamState, clearExamState } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examInfo, status] = await Promise.all([
        fetchExamInfo(),
        fetchAIStatus(),
      ]);
      setTopics(examInfo.topics);
      setAiStatus(status);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (topic?: string) => {
    setStarting(true);
    try {
      clearExamState();
      const questions = await startExam(topic);
      setExamState({
        questions,
        answers: questions.map((q) => ({ questionId: q.id, answer: '', confidence: 0 })),
        topic: topic || null,
        round: 1,
        lastResult: null,
        usedQuestionIds: [],  // เริ่มต้นใหม่
      });
      router.push('/exam');
    } catch (err) {
      console.error('Error starting exam:', err);
      setStarting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageLayout title="ระบบสอบ Adaptive">
      <AIStatusBadge status={aiStatus} />

      <div className="space-y-6">
        <h2 className="text-xl font-bold pb-3 border-b border-primary/20 text-primary">
          เลือกหัวข้อข้อสอบ
        </h2>

        <div className="grid gap-4">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleStartExam(topic)}
              disabled={starting}
              className="w-full p-5 text-left rounded-xl border border-primary/20 transition-all hover:shadow-md hover:border-primary hover:bg-primary hover:text-light
                         disabled:opacity-50 disabled:cursor-not-allowed bg-white text-dark group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{topic}</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => handleStartExam()}
          disabled={starting}
          className="w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 bg-accent text-dark"
        >
          {starting ? 'กำลังโหลด...' : 'สุ่มทุกหัวข้อ'}
        </button>

        <a
          href="/history"
          className="block w-full text-center py-3 rounded-xl border-2 transition-all font-semibold hover:bg-primary hover:text-light border-primary text-primary"
        >
          ดูประวัติการสอบ
        </a>
      </div>
    </PageLayout>
  );
}