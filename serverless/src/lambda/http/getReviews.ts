import { createLogger } from '../../utils/logger'
import { ReviewsHelper } from '../../businessLogic/reviewsHelper'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger(`GetReviewsLambda`)
const reviewsHelper = new ReviewsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    let restaurantId
    let Limit
    let LastEvaluatedKey
    let LastReviewId
    let LastRestaurantId
    let result: any = {}
    let statusCode: number
    let body: string
    try {
        const queryParams = event.queryStringParameters
        logger.debug(`Query params ${JSON.stringify(queryParams)}`)
        logger.debug(`Restaurant id ${queryParams.restaurantId}`)
        if (queryParams !== undefined && queryParams !== null) {
            LastReviewId = queryParams.LastReviewId === undefined ? null : queryParams.LastReviewId
            LastRestaurantId = queryParams.LastRestaurantId === undefined ? null : queryParams.LastRestaurantId
            Limit = queryParams.Limit === undefined ? 50 : queryParams.Limit
            restaurantId = queryParams.restaurantId === undefined ? null : queryParams.restaurantId
        }
        logger.info(`restaurantId is ${restaurantId}, LastReviewId is ${LastReviewId}, LastRestaurantId is ${LastRestaurantId},, Limit is ${Limit}`)
        if (LastRestaurantId !== null && LastReviewId !== null) {
            LastEvaluatedKey = { restaurantId: LastRestaurantId, reviewId: LastReviewId} 
        } else {
            LastEvaluatedKey = null
        }
        result = await reviewsHelper.getReviews(restaurantId, LastEvaluatedKey, Limit)
        statusCode = 200
        body = JSON.stringify({
            items : result.Items,
            LastEvaluatedKey: result.LastEvaluatedKey
        })
    } catch(err) {
        logger.error('Get reviews failed', { error: err.message })
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