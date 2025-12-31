'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchHistory, ExamResult } from '@/lib/api';

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await fetchHistory();
            setHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <PageLayout title="ประวัติการสอบ" showBackButton backHref="/">
            {history.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg mb-6 text-primary font-medium">
                        ยังไม่มีประวัติการสอบ
                    </p>
                    <a
                        href="/"
                        className="inline-block px-8 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-accent text-dark"
                    >
                        เริ่มทำข้อสอบ
                    </a>
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-lg text-center bg-primary text-light shadow-sm">
                                <div className="text-2xl font-bold">{history.length}</div>
                                <div className="text-sm opacity-80">ครั้งที่สอบ</div>
                            </div>
                            <div className="p-4 rounded-lg text-center bg-accent text-dark shadow-sm">
                                <div className="text-2xl font-bold">
                                    {history.length > 0
                                        ? Math.round(history.reduce((acc, h) => acc + (h.score / h.total) * 100, 0) / history.length)
                                        : 0}%
                                </div>
                                <div className="text-sm opacity-80">คะแนนเฉลี่ย</div>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-4">
                        {history.slice().reverse().map((h) => (
                            <div
                                key={h.id}
                                onClick={() => router.push(`/history/${h.id}`)}
                                className={`cursor-pointer p-5 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all bg-white hover:bg-gray-50 ${h.score >= h.total / 2 ? 'border-l-primary' : 'border-l-accent'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg text-primary">
                                            {new Date(h.timestamp).toLocaleDateString('th-TH', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                        <div className="text-sm mt-1 text-gray-500">
                                            {h.summary ? h.summary.substring(0, 60) + '...' : 'ไม่มีสรุปผล'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">
                                            {h.score}/{h.total}
                                        </div>
                                        <div className="text-xs mt-1 px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
                                            ดูรายละเอียด
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Back Home Button */}
                    <a
                        href="/"
                        className="block w-full text-center mt-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 bg-primary text-light"
                    >
                        กลับหน้าหลัก
                    </a>
                </>
            )}
        </PageLayout>
    );
}
