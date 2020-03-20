import { createLogger } from '../../utils/logger'
import { CuisinesHelper } from '../../businessLogic/cuisinesHelper'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger(`GetCuisinessLambda`)
const cuisinesHelper = new CuisinesHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    let items: any = []
    let statusCode: number
    let body: string
    try {
        items = await cuisinesHelper.getCuisines()
        logger.info(`Items returned from helper: ${JSON.stringify(items)}`)
        statusCode = 200
        body = JSON.stringify({
            items
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