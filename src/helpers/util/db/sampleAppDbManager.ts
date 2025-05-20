import * as sql from 'mssql';
import { fixture } from "../../../hooks/fixture";
import DataBagKeys from "../../../tests/steps/dataBagKeys";
import DateHelper from "../../types/dateHelper";
import ColumnDetails from "./columnDetails";
import DbManager, { DbConnectionMechanism } from "./dbManager";
import DbOperationResult from "./dbOperationResult";
import SampleSpResult from './resultSets/sampleSpResult';

/**
 * COLUMN DATA TYPES
 */
const COL_TYPE_INT = 'INT';

/**
 * tables
 */
const TBL_SAMPLE = 'SampleTable';

/**
 * colums
 */
const COL_FIRST_COLUMN = 'FirstColumn';
const COL_SECOND_COLUMN = 'SecondColumn';

export default class SampleAppDbManager {
    private dbManager: DbManager;
    private pool: any = null;
    constructor(){
        this.dbManager = new DbManager();
    }

    private async initializeConnectionPool(){
        if(process.env.USE_AZURE_CLI_FOR_DB !== 'true')
            this.pool = await this.dbManager.connectToDatabase();
        else
            this.pool = await this.dbManager.connectToDatabase(DbConnectionMechanism.AzureCli);
    }

    private async releaseDbResources(){
        await this.dbManager.clearDbResources(this.pool);
    }

    async deleteSampleRows(): Promise<DbOperationResult> {
        let dbOperationResult = new DbOperationResult();
        dbOperationResult.operationResult = false;
        
        try{
            await this.initializeConnectionPool();
            let result = await this.dbManager.deleteData(this.pool, TBL_SAMPLE);
            fixture.logger.info(`Completed deleting data from ${TBL_SAMPLE} with the result - ${JSON.stringify(result)}`);
            dbOperationResult.operationResult = true;
            dbOperationResult.operationData = result.rowsAffected;
        }catch(err){
            fixture.logger.error(`error encountered while deleting grower orders - ${JSON.stringify(err)}`);
        }finally{
            await this.releaseDbResources();
        }
        return dbOperationResult;
    }

    async insertSampleData(firstColumn: string, secondColumn: string): Promise<DbOperationResult> {
        let dbOperationResult = new DbOperationResult();
        dbOperationResult.operationResult = false;
        
        try{
            await this.initializeConnectionPool();
            let result = await this.dbManager.insertData(this.pool, TBL_SAMPLE, [firstColumn, secondColumn]);
            fixture.logger.info(`Completed inserting data into ${TBL_SAMPLE} with the result - ${JSON.stringify(result)}`);
            dbOperationResult.operationResult = true;            
        }catch(err){
            fixture.logger.error(`error encountered while inserting grower orders - ${JSON.stringify(err)}`);
        }finally{
            await this.releaseDbResources();
        }
        return dbOperationResult;
    }

    /*********************** STORED PROCEDURES **************************/
    async getDataFromSampleStoredProcedure(): Promise<DbOperationResult> {
        let dbOperationResult = new DbOperationResult();
        dbOperationResult.operationResult = false;
        const spName = 'proc_SampleStoredProcedure';

        const inputParams = /* if the SP takes parameters, mention those; otherwise leave empty array */
        [
            { name: COL_FIRST_COLUMN, type: sql.VarChar, value: 'SampleValue1' },
            { name: COL_SECOND_COLUMN, type: sql.VarChar, value: 'SampleValue2' }
        ];

        try {
            fixture.logger.info(`executing the stored procedure - ${spName}`);
            await this.initializeConnectionPool();
            const result = await this.dbManager.executeStoredProcedure<SampleSpResult>(
                this.pool,
                spName,
                inputParams,
                (row) => {
                    let data = new SampleSpResult();
                    data.ResCol1 = row.ResCol1;
                    data.ResCol2 = row.ResCol1;
                    return data;
                }
            );
            fixture.logger.info(`stored procedure - ${spName} - returned - ${result.length} - row(s)`);
            fixture.logger.info(`stored procedure - ${spName} - returned data is....`);
            result.forEach((row) => {
                fixture.logger.info(`${JSON.stringify(row)}`);
            });
            dbOperationResult.operationResult = true;
            dbOperationResult.operationData = result[0];
        } catch (err) {
            fixture.logger.error(`error encountered while executing the stored procedure - ${spName}. Error is - ${JSON.stringify(err)}`);
        } finally {
            await this.releaseDbResources();
        }
        return dbOperationResult;
    }    
}