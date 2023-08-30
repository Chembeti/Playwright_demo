import * as dotenv from 'dotenv'

export const getEnv = () => {
    // if (process.env.ENV) {
    //     dotenv.config({
    //         override: true,
    //         path: `src/helpers/env/.env.${process.env.ENV}`
    //     })
    // } else {
    //     console.warn(process.env.npm_config_ENV)
    //     console.error("NO ENV PASSED!")
    // }

    if (!process.env.npm_config_ENV){
        process.env.npm_config_ENV = "QA1"
        console.warn(`running tests in default environment - ${process.env.npm_config_ENV}`)
    }

    dotenv.config({
        override: true,
        path: `src/helpers/env/.env.${process.env.npm_config_ENV}`
    })
}