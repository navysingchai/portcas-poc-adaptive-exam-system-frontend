// API functions for communicating with backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// --- TYPES ---
export type QuestionType = 'MCQ' | 'WRITTEN';

export interface Question {
    id: number;
    text: string;
    type: QuestionType;
    topic?: string;
    choices?: string[];
    isActive?: boolean;
    isInitial?: boolean;
    createdBy?: 'CREATOR' | 'AI';
}

export interface Answer {
    questionId: number;
    answer: string;
    confidence: number;
}

export interface GradedAnswer extends Answer {
    isCorrect: boolean | null;
    feedback?: string;
    topic?: string;
    questionType?: QuestionType;
    questionText?: string;
}

export interface ExamResult {
    id: number;
    timestamp: string;
    score: number;
    total: number;
    answers: GradedAnswer[];
    summary?: string;
    nextSteps?: string[];
}

export interface AIStatus {
    aiEnabled: boolean;
    lastAdaptiveMethod: 'AI' | 'MANUAL';
    apiKeyConfigured: boolean;
}

export interface ExamInfo {
    topics: string[];
    totalQuestions: number;
}

export interface AdaptiveResponse {
    questions: Question[];
    analysis: {
        summary: string;
        nextSteps: string[];
        weakTopics: string[];
        strongTopics: string[];
    };
}

// --- API FUNCTIONS ---

export async function fetchAIStatus(): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/api/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch AI status');
    return res.json();
}

export async function fetchExamInfo(): Promise<ExamInfo> {
    const res = await fetch(`${API_BASE}/api/exams`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch exam info');
    return res.json();
}

export async function startExam(topic?: string): Promise<Question[]> {
    const url = topic
        ? `${API_BASE}/api/exam/start?topic=${encodeURIComponent(topic)}`
        : `${API_BASE}/api/exam/start`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to start exam');
    return res.json();
}

export async function submitExam(answers: Answer[]): Promise<{ result: ExamResult }> {
    const res = await fetch(`${API_BASE}/api/exam/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to submit exam');
    return res.json();
}

export async function fetchAdaptiveExam(resultId?: number): Promise<AdaptiveResponse> {
    const res = await fetch(`${API_BASE}/api/exam/adaptive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch adaptive exam');
    return res.json();
}

export async function fetchHistory(): Promise<ExamResult[]> {
    const res = await fetch(`${API_BASE}/api/history`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
}

export async function fetchHistoryItem(id: number): Promise<ExamResult> {
    const res = await fetch(`${API_BASE}/api/history/${id}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch history item');
    }
    return res.json();
}

export async function clearHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/api/history`, { method: 'DELETE', cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to clear history');
}
