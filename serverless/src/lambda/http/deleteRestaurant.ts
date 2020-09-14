import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { RestaurantsHelper } from '../../businessLogic/RestaurantsHelper'
import { getUserId } from '../utils'
import { DeleteRestaurantRequest } from '../../requests/DeleteRestaurantRequest'

const logger = createLogger(`DeleteRestaurantLambda`)
const restaurantsHelper = new RestaurantsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    const deleteRestaurantRequest: DeleteRestaurantRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    logger.info(`cuisineId is ${deleteRestaurantRequest.cuisineId} & userId is ${userId} & restaurantId is ${deleteRestaurantRequest.restaurantId}`)
    let statusCode: number
    let body: string = ''
    try {
      await restaurantsHelper.deleteRestaurant(deleteRestaurantRequest.cuisineId, deleteRestaurantRequest.restaurantId, userId)
      logger.info(`Restaurant deleted`)
      statusCode = 201
    } catch(err) {
      logger.error('Restaurant not deleted', { error: err.message })
      statusCode = 500
    }
    return {
        statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body
    }
}