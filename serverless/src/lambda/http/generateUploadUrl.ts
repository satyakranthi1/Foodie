import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { S3Helper } from '../../businessLogic/S3Helper'
import { ReviewsHelper } from '../../businessLogic/reviewsHelper'
import { GenerateUrlRequest } from '../../requests/GenerateUrlRequest'
import { getUserId } from '../utils'

const bucketName = process.env.IMAGES_S3_BUCKET
const logger = createLogger('GenerateUploadUrlLambda')
const s3Helper = new S3Helper()
const reviewsHelper = new ReviewsHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event ${JSON.stringify(event)}`)
    const generateUrlRequest: GenerateUrlRequest = JSON.parse(event.body)
    logger.info(`restaurantId is: ${generateUrlRequest.restaurantId} reviewId is: ${generateUrlRequest.reviewId} timestamp is ${generateUrlRequest.timestamp}`)
    const userId = getUserId(event)
    let preSignedUploadUrl: string
    let statusCode: number
    let body: string
    try {
      if (reviewsHelper.isUserReview(userId, generateUrlRequest.restaurantId)) {
        preSignedUploadUrl = await s3Helper.GenerateUploadUrl(generateUrlRequest.reviewId)
        const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${generateUrlRequest.reviewId}`
        await reviewsHelper.updateAttachmentUrl(generateUrlRequest.restaurantId, generateUrlRequest.timestamp, attachmentUrl)
        logger.info(`Updated todo with attachmentUrl`)
        statusCode = 201
        body = JSON.stringify({
          uploadUrl: preSignedUploadUrl,
          attachmentUrl: attachmentUrl
          })
      } else {
        throw new Error('Review does not belong to the user')
      }
    } catch(err) {
      logger.error('Operation threw an error', { error: err.message })
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