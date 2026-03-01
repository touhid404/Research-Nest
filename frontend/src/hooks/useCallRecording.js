import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for recording audio during a video call.
 * Uses MediaRecorder API to capture audio from the call's media streams.
 */
const useCallRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    // Timer for recording duration
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    /**
     * Clean up the media stream tracks.
     */
    const cleanupStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    /**
     * Stop recording and return the audio blob.
     */
    const stopRecording = useCallback(() => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.onstop = () => {
                    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
                    const blob = new Blob(chunksRef.current, { type: mimeType });
                    setAudioBlob(blob);
                    setIsRecording(false);
                    cleanupStream();
                    console.log(`[Recording] Stopped. Total size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
            } else {
                setIsRecording(false);
                cleanupStream();
                resolve(null);
            }
        });
    }, [cleanupStream]);

    /**
     * Start recording audio.
     * @param {MediaStream} externalStream - Optional external stream to record (e.g. mixed audio)
     */
    const startRecording = useCallback(async (externalStream = null) => {
        try {
            chunksRef.current = [];
            setAudioBlob(null);
            setRecordingDuration(0);

            let stream = externalStream;

            // If no external stream provided, capture default microphone
            if (!stream) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                    });
                } catch (micErr) {
                    console.error("Failed to get microphone access:", micErr);
                    throw new Error("Microphone access is required for recording. Please allow microphone permissions.");
                }
            }

            streamRef.current = stream;

            // Determine supported MIME type
            const mimeType = getSupportedMimeType();

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000, // 128kbps for decent quality
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                console.log(`[Recording] Stopped. Total size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
            };

            mediaRecorder.onerror = (event) => {
                console.error("[Recording] MediaRecorder error:", event.error);
                stopRecording();
            };

            // Collect data every 5 seconds for smoother processing
            mediaRecorder.start(5000);
            setIsRecording(true);
            console.log(`[Recording] Started with MIME type: ${mimeType}`);

        } catch (error) {
            console.error("[Recording] Failed to start recording:", error);
            cleanupStream();
            throw error;
        }
    }, [cleanupStream, stopRecording]);

    /**
     * Reset recording state.
     */
    const resetRecording = useCallback(() => {
        setAudioBlob(null);
        setRecordingDuration(0);
        chunksRef.current = [];
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            cleanupStream();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [cleanupStream]);

    return {
        isRecording,
        recordingDuration,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording,
    };
};

/**
 * Determine the best supported audio MIME type for MediaRecorder.
 */
function getSupportedMimeType() {
    const types = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }

    // Fallback
    return "audio/webm";
}

export default useCallRecording;
