'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { submitExam } from '@/lib/api';
import { getExamState, setExamState, ExamState } from '@/lib/store';
import { Question, Answer } from '@/lib/api';

// Utility function to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Randomize questions and their MCQ choices
function randomizeExam(questions: Question[]): Question[] {
    // Shuffle question order
    const shuffledQuestions = shuffleArray(questions);

    // Shuffle choices for each MCQ question
    return shuffledQuestions.map(q => ({
        ...q,
        choices: q.choices ? shuffleArray(q.choices) : q.choices,
    }));
}

export default function ExamPage() {
    const router = useRouter();
    const [state, setState] = useState<ExamState | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Store randomized questions separately to avoid re-shuffling on re-render
    const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const examState = getExamState();
        if (!examState.questions.length) {
            router.push('/');
            return;
        }
        setState(examState);

        // Randomize once when loading the exam
        setRandomizedQuestions(randomizeExam(examState.questions));
    }, [router]);

    const handleAnswerChange = (qId: number, field: 'answer' | 'confidence', value: string | number) => {
        if (!state) return;

        const newAnswers = state.answers.map((a) =>
            a.questionId === qId ? { ...a, [field]: value } : a
        );

        const newState = { ...state, answers: newAnswers };
        setState(newState);
        setExamState({ answers: newAnswers });
    };

    const handleSubmit = async () => {
        if (!state) return;

        setSubmitting(true);
        try {
            const { result } = await submitExam(state.answers);
            setExamState({ lastResult: result });
            router.push('/result');
        } catch (err) {
            console.error('Error submitting exam:', err);
            setSubmitting(false);
        }
    };

    if (!state) return <LoadingSpinner />;
    if (randomizedQuestions.length === 0) return <LoadingSpinner />;

    const { answers, topic, round } = state;

    return (
        <PageLayout
            title={topic ? `แบบทดสอบ: ${topic}` : 'แบบทดสอบ'}
            showBackButton
            backHref="/"
        >
            {/* Round Badge */}
            <div className="flex justify-center mb-6">
                <span
                    className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-primary text-light shadow-sm"
                >
                    รอบที่ {round}
                </span>
            </div>

            {/* Questions - ใช้ randomizedQuestions สำหรับการแสดงผล */}
            <div className="space-y-6">
                {randomizedQuestions.map((q: Question, idx: number) => {
                    const currentAns = answers.find((a: Answer) => a.questionId === q.id);
                    return (
                        <div
                            key={q.id}
                            className="p-6 rounded-xl border border-primary/20 bg-white shadow-sm"
                        >
                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-6">
                                <p className="font-semibold text-lg text-dark leading-relaxed">
                                    <span className="text-accent mr-2">{idx + 1}.</span>
                                    {q.text}
                                </p>
                                <div className="flex gap-2 ml-3 shrink-0">
                                    {q.topic && (
                                        <span
                                            className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary"
                                        >
                                            {q.topic}
                                        </span>
                                    )}
                                    {q.createdBy && (
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${q.createdBy === 'AI' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            {q.createdBy === 'AI' ? 'AI' : 'Standard'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Answer Input */}
                            <div className="mb-6">
                                {q.type === 'MCQ' ? (
                                    <div className="flex flex-col gap-3">
                                        {q.choices?.map((c) => (
                                            <label
                                                key={c}
                                                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${currentAns?.answer === c
                                                    ? 'border-accent bg-accent/5 text-dark font-medium shadow-sm'
                                                    : 'border-gray-200 bg-gray-50 text-dark hover:bg-gray-100'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    value={c}
                                                    checked={currentAns?.answer === c}
                                                    onChange={(e) => handleAnswerChange(q.id, 'answer', e.target.value)}
                                                    className="w-5 h-5 accent-accent"
                                                />
                                                <span>{c}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full border border-primary/20 p-4 rounded-lg transition-all resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 text-dark placeholder:text-gray-400"
                                        style={{
                                            color: 'var(--color-dark)'
                                        }}
                                        rows={3}
                                        placeholder="พิมพ์คำตอบที่นี่..."
                                        value={currentAns?.answer || ''}
                                        onChange={(e) => handleAnswerChange(q.id, 'answer', e.target.value)}
                                    />
                                )}
                            </div>

                            {/* Confidence Slider */}
                            <div
                                className="p-4 rounded-lg bg-primary/5 border border-primary/10"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-primary">
                                        ความมั่นใจของคุณ
                                    </label>
                                    <span className="font-bold text-lg text-accent">
                                        {currentAns?.confidence || 0}/5
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-primary/20 accent-accent"
                                    value={currentAns?.confidence || 0}
                                    onChange={(e) => handleAnswerChange(q.id, 'confidence', parseInt(e.target.value))}
                                />
                                <div className="flex justify-between text-xs mt-2 text-primary/60 font-medium">
                                    <span>เดาล้วนๆ</span>
                                    <span>มั่นใจสุดๆ</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-8 py-4 rounded-lg font-bold text-lg shadow-md transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 bg-accent text-dark"
            >
                {submitting ? 'กำลังส่งคำตอบ...' : 'ส่งคำตอบ'}
            </button>
        </PageLayout>
    );
}
