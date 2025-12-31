'use client';

import { AIStatus } from '@/lib/api';

interface AIStatusBadgeProps {
    status: AIStatus | null;
}

export default function AIStatusBadge({ status }: AIStatusBadgeProps) {
    if (!status) {
        return (
            <div
                className="mb-6 p-3 rounded text-center text-sm bg-primary text-light/70"
            >
                กำลังตรวจสอบสถานะระบบ...
            </div>
        );
    }

    if (status.aiEnabled) {
        return (
            <div
                className="mb-6 p-3 rounded text-center bg-primary text-light"
            >
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span
                        className="inline-block w-2 h-2 rounded-full bg-accent"
                    ></span>
                    <span className="font-medium">AI พร้อมใช้งาน</span>
                    <span
                        className="text-xs px-2 py-1 rounded bg-accent text-dark"
                    >
                        {status.lastAdaptiveMethod === 'AI' ? 'ตรวจโดย AI' : 'ตรวจอัตโนมัติ'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="mb-6 p-3 rounded text-center bg-dark text-light border border-primary"
        >
            <span className="font-medium">ระบบตรวจอัตโนมัติ</span>
        </div>
    );
}
