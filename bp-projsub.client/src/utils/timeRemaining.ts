export function getTimeRemaining(dueDate: string | Date): string {
    const now = new Date();
    const due = new Date(dueDate);

    if (due < now) {
        return "Overdue";
    }

    const diffMs = due.getTime() - now.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let result = "";
    if (days > 0) result += `${days} day${days !== 1 ? 's' : ''} `;
    if (hours > 0) result += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} minute${minutes !== 1 ? 's' : ''} `;

    return result ? `${result.trim()} left` : "Due now";
}

export function getTimeStatusColor(startDate: string | Date, endDate: string | Date | undefined): string {
    if (!endDate) {
        return "text-muted-foreground";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (end < now) {
        return "text-muted-foreground";
    }

    const totalTimeMs = end.getTime() - start.getTime();

    const elapsedTimeMs = Math.max(0, now.getTime() - start.getTime());

    const percentagePassed = (elapsedTimeMs / totalTimeMs) * 100;

    if (percentagePassed >= 50) {
        return "text-yellow-500";
    } else if (percentagePassed >= 85) {
        return "text-red-500";
    } else {
        return "text-muted-foreground";
    }
}


