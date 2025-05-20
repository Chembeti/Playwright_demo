/* eslint @typescript-eslint/no-explicit-any: "off" */
/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-return: "off" */
export default class DataBag{
    private _dataBag = {};

    saveData(key: string, value: any){
        this._dataBag[key] = value;
    }

    getData(key:string){
        return this._dataBag[key];
    }
}