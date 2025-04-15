export const formatUtcDate = (
    dateString?: string | null,
    options?: Intl.DateTimeFormatOptions
): string => {
    if (!dateString) return '';

    const utcDate = dateString.endsWith('Z')
        ? dateString
        : dateString + 'Z';

    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return new Date(utcDate).toLocaleString(
        'en-GB',
        options || defaultOptions
    );
};

export function ensureUtcDate(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
        return dateInput;
    }
    
    const utcDateString = dateInput.endsWith('Z') 
        ? dateInput 
        : dateInput + 'Z';
        
    return new Date(utcDateString);
}