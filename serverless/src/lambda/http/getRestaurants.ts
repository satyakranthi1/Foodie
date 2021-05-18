import { createLogger } from '../../utils/logger'
import { RestaurantsHelper } from '../../businessLogic/restaurantsHelper'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger(`GetRestaurantsLambda`)
const restaurantsHelper = new RestaurantsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    let LastEvaluatedKey
    let LastCuisineId
    let LastRestaurantId
    let Limit
    let cuisineId
    let result: any = []
    let statusCode: number
    let body: string
    try {
        const queryParams = event.queryStringParameters
        if (queryParams !== undefined && queryParams !== null) {
            LastCuisineId = queryParams.LastCuisineId === undefined ? null : queryParams.LastCuisineId
            LastRestaurantId = queryParams.LastRestaurantId === undefined ? null : queryParams.LastRestaurantId
            Limit = queryParams.Limit === undefined ? 50 : queryParams.Limit
            cuisineId = queryParams.cuisineId === undefined ? null : queryParams.cuisineId
        }
        logger.info(`CuisineId is ${cuisineId}, LastRestaurantId is ${LastRestaurantId}, LastCuisineId is ${LastCuisineId}, Limit is ${Limit}`)
        if(cuisineId !== null) {
            if (LastCuisineId !== null && LastRestaurantId !== null) {
                LastEvaluatedKey = { cuisineId: LastCuisineId, restaurantId: LastRestaurantId }
            } else {
                LastEvaluatedKey = null
            }
            result = await restaurantsHelper.getRestaurants(cuisineId, LastEvaluatedKey, Limit)
            statusCode = 200
            body = JSON.stringify({
                items: result.items,
                LastEvaluatedKey: result.LastEvaluatedKey
            })
        } else {
            statusCode = 400
            body = 'Missing cuisine Id'
        }
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