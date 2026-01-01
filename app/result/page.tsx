'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import AIStatusBadge from '@/components/AIStatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchAdaptiveExam, fetchAIStatus, AIStatus } from '@/lib/api';
import { getExamState, setExamState, clearExamState } from '@/lib/store';
import { GradedAnswer } from '@/lib/api';

export default function ResultPage() {
    const router = useRouter();
    const [state, setState] = useState<ReturnType<typeof getExamState> | null>(null);
    const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const examState = getExamState();
        if (!examState.lastResult) {
            router.push('/');
            return;
        }
        setState(examState);
        fetchAIStatus().then(setAiStatus).catch(console.error);
    }, [router]);

    const handleContinue = async () => {
        if (!state) return;

        setLoading(true);
        try {
            // Bug Fix #3: รวบรวม questionIds ที่เคยทำไปแล้วทุกรอบ
            const currentUsedIds = state.usedQuestionIds || [];
            const newUsedIds = [...currentUsedIds, ...state.questions.map(q => q.id)];

            const response = await fetchAdaptiveExam(state.lastResult?.id, newUsedIds);
            const questions = response.questions;
            setExamState({
                questions,
                answers: questions.map((q) => ({ questionId: q.id, answer: '', confidence: 0 })),
                round: state.round + 1,
                lastResult: null,
                usedQuestionIds: newUsedIds,  // บันทึก IDs ที่ใช้ไปแล้ว
            });
            await fetchAIStatus().then(setAiStatus);
            router.push('/exam');
        } catch (err) {
            console.error('Error fetching adaptive exam:', err);
            setLoading(false);
        }
    };

    const handleFinish = () => {
        clearExamState();
        router.push('/history');
    };

    const handleHome = () => {
        clearExamState();
        router.push('/');
    };

    if (!state?.lastResult) return <LoadingSpinner />;

    const { lastResult, round } = state;

    return (
        <PageLayout title={`ผลการทดสอบ (รอบที่ ${round})`}>
            <AIStatusBadge status={aiStatus} />

            {/* Score Display */}
            <div className="text-center mb-8">
                <div
                    className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-accent bg-primary text-light"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-bold">
                            {lastResult.score}
                        </span>
                        <span className="text-2xl opacity-70">
                            /{lastResult.total}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bug Fix #2: AI Summary - แสดงทันทีหลังส่งคำตอบ */}
            {lastResult.summary && (
                <div className="mb-6 p-5 rounded-lg border border-accent/30 bg-accent/5 shadow-sm">
                    <h3 className="font-semibold mb-3 text-accent text-lg">สรุปผลการวิเคราะห์</h3>
                    <p className="text-dark leading-relaxed mb-4">{lastResult.summary}</p>

                    {lastResult.nextSteps && lastResult.nextSteps.length > 0 && (
                        <div>
                            <h4 className="font-medium text-primary mb-2">สิ่งที่ควรพัฒนา:</h4>
                            <ul className="list-disc list-inside space-y-1 text-dark/80">
                                {lastResult.nextSteps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Answer Details */}
            <div
                className="mb-8 p-5 rounded-lg border border-primary/20 bg-white shadow-sm"
            >
                <h3 className="font-semibold mb-4 text-primary text-lg border-b border-gray-100 pb-2">
                    รายละเอียดคำตอบ
                </h3>
                <div className="space-y-4">
                    {lastResult.answers.map((ans: GradedAnswer, idx: number) => {
                        const isPending = ans.isCorrect === null;
                        const isCorrect = ans.isCorrect === true;

                        return (
                            <div
                                key={idx}
                                className={`p-5 rounded-lg border border-l-4 transition-all hover:shadow-md ${isPending ? 'border-l-accent border-gray-200' :
                                    isCorrect ? 'border-l-primary border-gray-200' :
                                        'border-l-gray-500 border-gray-200'
                                    } bg-white`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-dark text-lg">
                                        ข้อ {idx + 1}
                                        {ans.topic && <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ans.topic}</span>}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isPending ? 'bg-accent/10 text-accent' :
                                            isCorrect ? 'bg-primary/10 text-primary' :
                                                'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {isPending ? 'รอตรวจ' : isCorrect ? 'ถูกต้อง' : 'ผิด'}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <div className="mb-4 text-dark/80 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                    {ans.questionText || '(ไม่พบโจทย์)'}
                                </div>

                                {/* User's Answer */}
                                <div className="mb-3">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">คำตอบของคุณ</h4>
                                    <div
                                        className="p-4 rounded-lg text-sm bg-blue-50/50 text-dark border border-blue-100 whitespace-pre-wrap leading-relaxed"
                                    >
                                        {ans.answer || '(ไม่ได้ตอบ)'}
                                    </div>
                                </div>

                                {/* Confidence */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="text-xs font-medium text-gray-500">ความมั่นใจ:</div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <div
                                                key={star}
                                                className={`w-2 h-2 rounded-full ${star <= ans.confidence ? 'bg-accent' : 'bg-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback Display */}
                                {ans.feedback && (
                                    <div className="mt-4 animate-fadeIn">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Feedback</h4>
                                        <div
                                            className="p-4 rounded-lg text-sm bg-primary/5 text-dark border border-primary/10 leading-relaxed"
                                        >
                                            {ans.feedback}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Text */}
            <p className="text-center mb-6 text-primary font-medium">
                ระบบได้วิเคราะห์จุดอ่อนของคุณเรียบร้อยแล้ว
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
                {lastResult.score === lastResult.total ? (
                    <div className="p-6 rounded-xl text-center bg-green-50 text-green-700 border border-green-200 mb-4 shadow-sm">
                        <div className="font-bold text-2xl mb-2">100%</div>
                        <p className="opacity-90">คณได้จบการฝึกฝนในหัวข้อนี้แล้ว</p>
                    </div>
                ) : (
                    <button
                        onClick={handleContinue}
                        disabled={loading}
                        className="w-full py-4 rounded-lg font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-accent text-dark"
                    >
                        {loading ? 'กำลังเตรียมข้อสอบ...' : 'พัฒนาตนเองต่อ (Adaptive Exam)'}
                    </button>
                )}

                <button
                    onClick={handleFinish}
                    className="w-full py-3 rounded-lg font-medium transition-all hover:bg-primary/90 bg-primary text-light"
                >
                    ดูประวัติและสิ้นสุดการทำ
                </button>

                <button
                    onClick={handleHome}
                    className="w-full py-3 rounded-lg font-medium border-2 transition-all hover:bg-gray-50 border-primary text-primary"
                >
                    กลับหน้าหลัก
                </button>
            </div>
        </PageLayout>
    );
}
