
export class NewCalendarEntry {
    start_date: string;
    end_date: string;
    username: string;
    position: string;

    constructor(
        start_date: string,
        end_date: string,
        username: string,
        position: string,
    ) {
        this.start_date = start_date;
        this.end_date = end_date;
        this.username = username;
        this.position = position;

    }
}