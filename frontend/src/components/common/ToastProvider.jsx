import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import { useEffect } from 'react';

const ToastProvider = () => {
    const { toasts } = useToasterStore();

    // Limit visible toasts to 1
    useEffect(() => {
        toasts
            .filter((t) => t.visible) // Only consider visible toasts
            .filter((_, i) => i >= 1) // Keep only the first one (most recent stays, others dismissed)
            .forEach((t) => toast.dismiss(t.id));
    }, [toasts]);

    return (
        <Toaster
            position="bottom-left"
            toastOptions={{
                className: 'custom-toast',
                duration: 4000,
                success: {
                    iconTheme: {
                        primary: '#8b5cf6', // violet-500
                        secondary: '#ffffff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444', // red-500
                        secondary: '#ffffff',
                    },
                },
            }}
            containerStyle={{
                bottom: 40,
                left: 40,
            }}
        />
    );
};

export default ToastProvider;
