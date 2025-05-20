/*eslint @typescript-eslint/restrict-template-expressions: "off" */
import { transports, format } from "winston"
const { combine, timestamp, json } = format;
export function options(scenarioName: string) {
    return {
        transports: [
            new transports.File({
                filename: `test-results/logs/${scenarioName}/log.log`,
                level: process.env.LOG_LEVEL || 'info',
                format: combine(timestamp({
                    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
                  }), json()),
            }),
        ]
    }
}