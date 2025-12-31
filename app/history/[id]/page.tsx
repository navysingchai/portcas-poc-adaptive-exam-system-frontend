'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ExamResult, fetchHistoryItem, fetchAdaptiveExam } from '@/lib/api';
import { setExamState } from '@/lib/store';

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchHistoryItem(parseInt(id))
            .then(setResult)
            .catch((err) => {
                console.error(err);
                router.push('/history');
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleContinue = async () => {
        if (!result) return;
        setGenerating(true);
        try {
            const response = await fetchAdaptiveExam(result.id);
            setExamState({
                questions: response.questions,
                answers: response.questions.map(q => ({ questionId: q.id, answer: '', confidence: 0 })),
                round: 1,
                lastResult: null
            });
            router.push('/exam');
        } catch (err) {
            console.error(err);
            setGenerating(false);
        }
    };

    if (loading || !result) return <LoadingSpinner />;

    return (
        <PageLayout title="รายละเอียดผลการทดสอบ">
            {/* Back Button and Header */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
                    style={{ color: '#2B3A67' }}
                >
                    ← ย้อนกลับ
                </button>
                <div className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
                    {new Date(result.timestamp).toLocaleString('th-TH')}
                </div>
            </div>

            {/* Score Summary */}
            <div className="mb-8 p-8 rounded-2xl text-center bg-primary text-light shadow-lg transform transition-all hover:scale-[1.02]">
                <div className="text-5xl font-bold mb-2 tracking-tight">
                    {result.score} / {result.total}
                </div>
                <div className="text-sm opacity-90 font-medium tracking-wide uppercase">
                    คะแนนรวม
                </div>
            </div>

            {/* Analysis Summary */}
            {result.summary && (
                <div className="mb-6 p-6 rounded-xl border-l-4 border-accent bg-white shadow-sm">
                    <h3 className="font-bold mb-3 text-primary text-lg flex items-center gap-2">
                        สรุปผลการวิเคราะห์
                    </h3>
                    <p className="text-dark leading-relaxed">{result.summary}</p>
                </div>
            )}

            {/* Next Steps */}
            {result.nextSteps && result.nextSteps.length > 0 && (
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-white to-orange-50 border border-orange-100 shadow-sm">
                    <h3 className="font-bold mb-4 text-primary text-lg flex items-center gap-2">
                        สิ่งที่ควรทำต่อ
                    </h3>
                    <ul className="space-y-3">
                        {result.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-dark">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Details List */}
            <div className="mt-8 space-y-6">
                <h3 className="font-bold text-xl mb-6 text-primary border-b border-gray-200 pb-3">
                    รายละเอียดรายข้อ
                </h3>
                {result.answers.map((ans, idx) => {
                    const isCorrect = ans.isCorrect === true;
                    const isPending = ans.isCorrect === null;
                    return (
                        <div key={idx} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="font-bold text-lg text-primary flex items-center gap-2">
                                    <span>ข้อที่ {idx + 1}</span>
                                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {ans.topic}
                                    </span>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${isPending ? 'bg-accent/10 text-accent' :
                                        isCorrect ? 'bg-primary/10 text-primary' :
                                            'bg-red-100 text-red-600'
                                        }`}
                                >
                                    {isPending ? 'รอตรวจ' : isCorrect ? 'ถูกต้อง' : 'ผิด'}
                                </span>
                            </div>

                            <div className="mb-4 font-medium text-lg text-dark bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                                "{ans.questionText || 'โจทย์คำถาม...'}"
                            </div>

                            <div className="mb-4">
                                <div className="text-xs font-bold mb-2 text-gray-500 uppercase tracking-wider">คำตอบของคุณ</div>
                                <div className="p-4 rounded-lg bg-blue-50/50 text-dark border border-blue-100 whitespace-pre-wrap leading-relaxed shadow-sm">
                                    {ans.answer || '(ไม่ได้ตอบ)'}
                                </div>
                            </div>

                            {ans.feedback && (
                                <div className="mt-4 animate-fadeIn">
                                    <div className="text-xs font-bold mb-2 text-primary uppercase tracking-wider">AI Feedback</div>
                                    <div className="p-4 rounded-lg text-sm bg-primary/5 text-dark border border-primary/10 leading-relaxed">
                                        {ans.feedback}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Continue / Mastery Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                {result.score === result.total ? (
                    <div className="p-6 rounded-xl text-center bg-green-50 text-green-700 border border-green-200">
                        <div className="font-bold text-2xl mb-2">🎉 ผ่านการทดสอบระดับนี้แล้ว!</div>
                        <p className="text-base">คุณทำคะแนนได้ยอดเยี่ยม ไม่จำเป็นต้องฝึกซ้ำในหัวข้อเดิม</p>
                    </div>
                ) : (
                    <button
                        onClick={handleContinue}
                        disabled={generating}
                        className="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all flex items-center justify-center gap-3 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none bg-accent text-white"
                    >
                        {generating ? (
                            <>
                                <span className="animate-spin text-2xl">⟳</span> กำลังวิเคราะห์และสร้างโจทย์...
                            </>
                        ) : (
                            'ฝึกฝนจุดอ่อนต่อ'
                        )}
                    </button>
                )}
            </div>
        </PageLayout>
    );
}
