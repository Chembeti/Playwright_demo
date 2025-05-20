import { fixture } from "../../hooks/fixture";
import { toZonedTime } from 'date-fns-tz';

const { format } = require('date-fns');

export default abstract class DateHelper {
    static getWeekDayName(weekDayNumber: number): string {
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return weekday[weekDayNumber];
    }

    static getTimeStamp(dateFormat: string = ""): string {
        if (dateFormat.length === 0)
            dateFormat = 'yyyy-MM-dd HH:mm:ss.SSS';

        let td = Date.now();
        return format(td, dateFormat);
    }

    /**
     * 
     * @param daysToAdd 
     * @returns returns current date in UTC as YYYY-MM-DD
     */
    static getDateTimeUTC(daysToAdd: number = 0): string {
        var date = new Date();

        // Add the specified number of days to the date
        date.setDate(date.getDate() + daysToAdd);

        var isoString = date.toISOString();

        // Split the isoString at 'T' and return the date part
        return isoString.split('T')[0];
    }

    /**
     * 
     * @returns returns a unique string considering current date & time; first 8 characters represent YYYYMMDD
     */
    static getUniqueNumberBasedOnDate(): string {
        let result = DateHelper.getDateTimeUTC();
        result = result.replaceAll("-", "");
        result += (new Date()).getTime().toString();
        return result;
    }

    static getCSTDate(dateStrVal: string): Date {
        const utcDate = new Date(dateStrVal);

        // Define the CST timezone
        const timeZone = 'America/Chicago';

        // Convert the UTC date to CST
        const cstDate = toZonedTime(utcDate, timeZone);

        fixture.logger.info(`converted CST date is - ${cstDate}`);
        return cstDate;
    }

    /**
     * 
     * @param date - date object
     * @returns returns date in MM/DD/YYYY format
     * @example 04/13/2025
     */
    static formatDate_MM_DD_YYYY(date: Date): string {
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

}