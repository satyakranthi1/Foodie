import * as uuid from 'uuid'

import { createLogger } from '../utils/logger'
import { ReviewsAccess } from '../dataLayer/reviewsAccess'
import { CreateReviewRequest } from '../requests/CreateReviewRequest'
import { ReviewItem } from '../models/ReviewItem'

const logger = createLogger(`ReviewsHelper`)
const reviewsAccess = new ReviewsAccess()

export class ReviewsHelper {
    async getReviews(restaurantId: string) {
        logger.info(`restaurantId received ${restaurantId}`)
        let items: any
        try {
            items = await reviewsAccess.getReviews(restaurantId)
            logger.info(`items returned from reviewsAccess layer: ${JSON.stringify(items)}`)
            return items
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }
    
    async createReview(newReview: CreateReviewRequest, userId: string) {
        logger.info(`Creating new review`)
        let result: any
        const timestamp = new Date().toISOString()
        const reviewId = uuid.v4()
        const addReviewItem: ReviewItem = {
            ...newReview,
            timestamp,
            reviewId,
            userId
        }
        try {
            result = await reviewsAccess.putReview(addReviewItem)
            return result
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async updateAttachmentUrl(restaurantId: string, timestamp: string, attachmentUrl: string) {
        logger.info(`Updating review of timestamp: ${timestamp} with attachmentUrl: ${attachmentUrl} for restaurant: ${restaurantId}`)
        try {
            await reviewsAccess.updateAttachmentUrl(restaurantId, timestamp, attachmentUrl)
        } catch(err) {
            logger.error('operation threw an error', { error: 'Update Url failed' })
            throw new Error(err)
        }
    }

    async isUserReview(reviewId: string, restaurantId: string) {
        logger.info(`Comparing userId with reviewId: ${reviewId} of restaurantId: ${restaurantId}`)
        try {
            await reviewsAccess.isUserReview(reviewId, restaurantId)
        } catch(err) {
            logger.error('operation threw an error', { error: 'is user review failed' })
        }
    }
}