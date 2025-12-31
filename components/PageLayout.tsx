'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
    children: ReactNode;
    title?: string;
    showBackButton?: boolean;
    backHref?: string;
}

export default function PageLayout({
    children,
    title,
    showBackButton = false,
    backHref = '/'
}: PageLayoutProps) {
    return (
        <div className="min-h-screen p-4 md:p-8 bg-dark">
            <div className="max-w-3xl mx-auto">
                {/* Main Card */}
                <div
                    className="rounded-lg shadow-xl p-6 md:p-8 bg-light text-dark"
                >
                    {/* Navigation */}
                    {showBackButton && (
                        <a
                            href={backHref}
                            className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-primary"
                        >
                            ← กลับ
                        </a>
                    )}

                    {/* Title */}
                    {title && (
                        <h1
                            className="text-2xl md:text-3xl font-bold mb-6 text-center text-primary"
                        >
                            {title}
                        </h1>
                    )}

                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-sm mt-6 text-light/60">
                    Adaptive Exam System
                </p>
            </div>
        </div>
    );
}
