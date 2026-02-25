
import JapaneseHolidays from 'japanese-holidays';

/**
 * Checks if the given date is available for delivery.
 * Allowed: Monday (1), Wednesday (3), Friday (5)
 * Excluded: Japanese Public Holidays
 */
export const isDeliveryAvailable = (date: Date): boolean => {
    // 1. Check Day of Week
    const day = date.getDay();
    const isMonWedFri = day === 1 || day === 3 || day === 5;

    if (!isMonWedFri) {
        return false;
    }

    // 2. Check Holiday
    // isHoliday returns the holiday name (string) or undefined
    const holiday = JapaneseHolidays.isHoliday(date);
    if (holiday) {
        return false;
    }

    return true;
};
