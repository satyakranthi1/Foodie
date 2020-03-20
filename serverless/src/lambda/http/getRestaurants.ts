import { createLogger } from '../../utils/logger'
import { RestaurantsHelper } from '../../businessLogic/restaurantsHelper'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger(`GetRestaurantsLambda`)
const restaurantsHelper = new RestaurantsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    const cuisineId = event.pathParameters.cuisineId
    logger.info(`CuisineId is ${cuisineId}`)
    let items: any = []
    let statusCode: number
    let body: string
    try {
        items = await restaurantsHelper.getRestaurants(cuisineId)
        statusCode = 200
        body = JSON.stringify({
            items
        })
    } catch(err) {
        logger.error('Get restaurants failed', { error: err.message })
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