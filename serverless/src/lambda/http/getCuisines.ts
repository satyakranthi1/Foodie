import { createLogger } from '../../utils/logger'
import { CuisinesHelper } from '../../businessLogic/cuisinesHelper'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger(`GetCuisinessLambda`)
const cuisinesHelper = new CuisinesHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    let LastCuisineId
    let LastEvaluatedKey
    let Limit
    let result: any = {}
    let statusCode: number
    let body: string
    try {
        const queryParams = event.queryStringParameters
        if (queryParams !== undefined && queryParams !== null) {
            LastCuisineId = queryParams.LastCuisineId === undefined ? null : queryParams.LastCuisineId
            Limit = queryParams.Limit === undefined ? 50 : queryParams.Limit
        }
        logger.info(`LastCuisineId is ${LastCuisineId}, Limit is ${Limit}`)
        if (LastCuisineId !== null) {
            LastEvaluatedKey = { id: LastCuisineId }
        } else {
            LastEvaluatedKey = null
        }
        result = await cuisinesHelper.getCuisines(LastEvaluatedKey, Limit)
        logger.info(`result returned from helper: ${JSON.stringify(result)}`)
        statusCode = 200
        body = JSON.stringify({
            items: result.Items,
            LastEvaluatedKey: result.LastEvaluatedKey
        })
    } catch(err) {
        logger.error('Get cuisines failed', { error: err.message })
        statusCode = 500
        body = ''
    }
    return {
        statusCode,
        headers: {
            'Access-Control-allow-Origin': '*'
        },
        body
    }
}