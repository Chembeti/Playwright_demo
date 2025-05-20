export default abstract class StringValidator {
    static isValidString(strToCheck: string, strMinimumLengthToVerify: number = 1): boolean{
        return (strToCheck != undefined && strToCheck.length >= strMinimumLengthToVerify);
    }
}