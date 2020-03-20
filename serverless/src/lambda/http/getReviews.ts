import { createLogger } from '../../utils/logger'
import { ReviewsHelper } from '../../businessLogic/reviewsHelper'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger(`GetReviewsLambda`)
const reviewsHelper = new ReviewsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    const restaurantId = event.pathParameters.restaurantId
    logger.info(`restaurantId is ${restaurantId}`)
    let items: any = {}
    let statusCode: number
    let body: string
    try {
        items = await reviewsHelper.getReviews(restaurantId)
        statusCode = 200
        body = JSON.stringify({
            items
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