export class DateHelper {

    static getCurrentTimestamp(): string {
        return new Date().getTime().toString();
    }   


    static convertDateToTimestamp(date:string):number{
        return new Date(date).getTime();
    }
}