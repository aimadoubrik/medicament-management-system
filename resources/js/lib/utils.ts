import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flattenMessages(nestedMessages: Record<string, any>, prefix = ''): Record<string, string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(nestedMessages).reduce((messages: Record<string, any>, key) => {
        const value = nestedMessages[key];
        const prefixedKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'string') {
            messages[prefixedKey] = value;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recursively flatten nested objects
            Object.assign(messages, flattenMessages(value, prefixedKey));
        } else {
            // Optionally handle arrays or other types if needed, or log a warning
            console.warn(`Unsupported message format for key "${prefixedKey}":`, value);
            // Assign as is, or stringify, or skip, depending on desired behavior
            // messages[prefixedKey] = JSON.stringify(value); // Example: stringify non-object/non-string values
        }

        return messages;
    }, {});
}
