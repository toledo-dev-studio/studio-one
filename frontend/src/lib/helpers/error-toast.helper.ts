import { toast } from "sonner";

/**
 * Show an error notification.
 * @param message Short description of the error.
 * @param description Optional extra context.
 */
export const showErrorToast = (message: string, description?: string) => {
    toast.error(message, { description });
};

/**
 * Show a success notification.
 * @param message Short description of the result.
 * @param description Optional extra context.
 */
export const showSuccessToast = (message: string, description?: string) => {
    toast.success(message, { description });
};
