import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { CreateRestaurantRequest } from '../../requests/CreateRestaurantRequest'
import { RestaurantItem } from '../../models/RestaurantItem'
import { RestaurantsHelper } from '../../businessLogic/RestaurantsHelper'
import { getUserId } from '../utils'

const logger = createLogger(`CreateRestaurantLambda`)
const restaurantsHelper = new RestaurantsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    const newRestaurant: CreateRestaurantRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    let addedRestaurant: RestaurantItem;
    let statusCode: number
    let body: string
    try {
        if (userId === newRestaurant.userId ){
            addedRestaurant = await restaurantsHelper.createRestaurant(newRestaurant)
            logger.info(`Added Restaurant Item: ${JSON.stringify(addedRestaurant)}`)
            statusCode = 201
            body = JSON.stringify({
                item: {
                    addedRestaurant
                }
            })
        } else {
            logger.error('UserId Mismatch in CreateRestaurantRequest')
            statusCode = 400
        }
    } catch(err) {
        logger.error('Restaurant not created', { error: err.message })
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