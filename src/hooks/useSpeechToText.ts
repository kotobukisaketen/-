import { useState, useCallback, useRef } from "react";

export function useSpeechToText() {
    const [isListening, setIsListening] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback((fieldId: string, onResult: (text: string) => void) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("お使いのブラウザは音声認識に対応していません。");
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "ja-JP";
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(fieldId);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(null);
        };

        recognition.onend = () => {
            setIsListening(null);
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(null);
        }
    }, []);

    return { isListening, startListening, stopListening };
}
