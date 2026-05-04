'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
};

const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;
function genId() { return `toast-${count++}`; }

type ActionType = typeof actionTypes;
type Action =
    | { type: ActionType['ADD_TOAST']; toast: ToasterToast }
    | { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
    | { type: ActionType['DISMISS_TOAST']; toastId?: ToasterToast['id'] }
    | { type: ActionType['REMOVE_TOAST']; toastId?: ToasterToast['id'] };

interface State { toasts: ToasterToast[] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD_TOAST':
            return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
        case 'UPDATE_TOAST':
            return { ...state, toasts: state.toasts.map(t => t.id === action.toast.id ? { ...t, ...action.toast } : t) };
        case 'DISMISS_TOAST': {
            const { toastId } = action;
            if (toastId) {
                if (!toastTimeouts.has(toastId)) {
                    toastTimeouts.set(toastId, setTimeout(() => { dispatch({ type: 'REMOVE_TOAST', toastId }); }, TOAST_REMOVE_DELAY));
                }
            } else {
                state.toasts.forEach(t => dispatch({ type: 'DISMISS_TOAST', toastId: t.id }));
            }
            return { ...state, toasts: state.toasts.map(t => (!toastId || t.id === toastId) ? { ...t, open: false } : t) };
        }
        case 'REMOVE_TOAST':
            if (!action.toastId) return { ...state, toasts: [] };
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) };
    }
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach(l => l(memoryState));
}

function toast({ ...props }: Omit<ToasterToast, 'id'>) {
    const id = genId();
    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });
    dispatch({ type: 'ADD_TOAST', toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss(); } } });
    return { id, dismiss };
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => { const idx = listeners.indexOf(setState); if (idx > -1) listeners.splice(idx, 1); };
    }, [state]);
    return { ...state, toast, dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }) };
}

export { toast, useToast };
