import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { CreateReviewRequest } from '../../requests/CreateReviewRequest'
import { ReviewItem } from '../../models/ReviewItem'
import { ReviewsHelper } from '../../businessLogic/ReviewsHelper'
import { getUserId } from '../utils'

const logger = createLogger(`CreateReviewLambda`)
const reviewsHelper = new ReviewsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    const newReview: CreateReviewRequest = JSON.parse(event.body)
    logger.info(`Parsed event body: ${JSON.stringify(newReview)}`)
    let addedReview: ReviewItem;
    let statusCode: number
    let body: string
    try {
        addedReview = await reviewsHelper.createReview(newReview)
        logger.info(`Added review item: ${JSON.stringify(addedReview)}`)
        statusCode = 201
        body = JSON.stringify({
            item: {
                addedReview
            }
        })
    } catch(err) {
        logger.error('Review not created', { error: err.message })
        statusCode = 500
        body = ''
    }
    
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body
    }
}