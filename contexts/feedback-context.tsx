"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type FeedbackType = "success" | "error" | "info" | "warning";

interface FeedbackMessage {
    id: string;
    type: FeedbackType;
    message: string;
    duration?: number;
}

interface FeedbackContextType {
    messages: FeedbackMessage[];
    addMessage: (
        type: FeedbackType,
        message: string,
        duration?: number
    ) => void;
    removeMessage: (id: string) => void;
    clearMessages: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
    undefined
);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<FeedbackMessage[]>([]);

    const addMessage = useCallback(
        (type: FeedbackType, message: string, duration: number = 5000) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newMessage: FeedbackMessage = { id, type, message, duration };

            setMessages((prev) => [...prev, newMessage]);

            // Auto-remove message after duration
            if (duration > 0) {
                setTimeout(() => {
                    setMessages((prev) => prev.filter((msg) => msg.id !== id));
                }, duration);
            }
        },
        []
    );

    const removeMessage = useCallback((id: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return (
        <FeedbackContext.Provider
            value={{ messages, addMessage, removeMessage, clearMessages }}
        >
            {children}
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error("useFeedback must be used within a FeedbackProvider");
    }
    return context;
}
