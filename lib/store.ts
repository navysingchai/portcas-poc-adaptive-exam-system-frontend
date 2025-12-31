// Simple state management for exam flow using localStorage

import { Question, Answer, ExamResult } from './api';

const EXAM_STATE_KEY = 'exam_state';

export interface ExamState {
    questions: Question[];
    answers: Answer[];
    topic: string | null;
    round: number;
    lastResult: ExamResult | null;
}

const defaultState: ExamState = {
    questions: [],
    answers: [],
    topic: null,
    round: 1,
    lastResult: null,
};

export function getExamState(): ExamState {
    if (typeof window === 'undefined') return defaultState;

    try {
        const stored = localStorage.getItem(EXAM_STATE_KEY);
        return stored ? JSON.parse(stored) : defaultState;
    } catch {
        return defaultState;
    }
}

export function setExamState(state: Partial<ExamState>): void {
    if (typeof window === 'undefined') return;

    const current = getExamState();
    const newState = { ...current, ...state };
    localStorage.setItem(EXAM_STATE_KEY, JSON.stringify(newState));
}

export function clearExamState(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(EXAM_STATE_KEY);
}
