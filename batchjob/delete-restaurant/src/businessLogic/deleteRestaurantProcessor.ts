import { RestaurantAccess } from '../dataLayer/restaurantAccess'
import { ReviewAccess } from '../dataLayer/reviewAccess'
import { SQSHelper } from '../queueLayer/sqsHelper'
import { S3Helper } from '../s3Layer/s3Helper'
import { createLogger } from '../utils/logger'

const config = require('../config.json')
const logger = createLogger(`DeleteRestaurantProcessor`)
const restaurantQueueUrl = config.RESTAURANT_ERROR_QUEUE
const reviewsQueueUrl = config.REVIEW_ERROR_QUEUE
const restaurantAccess = new RestaurantAccess()
const reviewAccess = new ReviewAccess()
const s3Helper = new S3Helper()
const sqsHelper = new SQSHelper()

export class DeleteRestaurantProcessor {

    async deleteRestaurants() {
        await this.processRestaurantErrorQueue()
        await this.processReviewErrorQueue()
        let result: any
        try {
            result = await restaurantAccess.getDeletedRestaurants()
            if(result.Items !== undefined && result.Items !== null && result.Items.length !== 0) {
                await this.processDeletedRestaurants(result.Items)
                while (result.LastEvaluatedKey !== undefined && result.LastEvaluatedKey !== null) {
                    logger.debug(`LastEvaluatedKey: ${JSON.stringify(result.LastEvaluatedKey)}`)
                    result = await restaurantAccess.getDeletedRestaurants(result.LastEvaluatedKey)
                    if(result.Items !== undefined && result.Items !== null && result.Items.length !== 0)
                        await this.processDeletedRestaurants(result.Items)
                }
            }   
        }catch(err) {
            logger.error(`Error deleting restaurants ${JSON.stringify(err)}`)
        }
    }
    
    async processDeletedRestaurants(items: any) {
        if(items !== undefined && items !== null && items.length !== 0) {
            for (const restaurant of items) {
                try {
                    await this.processDeletedRestaurant(restaurant.restaurantId)
                }catch(err) {
                    logger.error(`Error processing deleted restaurant: ${JSON.stringify(restaurant)}`)
                }
            }
        }
        try {
            await restaurantAccess.deleteRestaurants(items)
        }catch(err) {
            logger.error(`Error deleting restaurants: ${JSON.stringify(items)}`)
            sqsHelper.sendMessageBatch(restaurantQueueUrl, items)
        }
    }

    async processDeletedRestaurant(restaurantId) {
        try {
            if (restaurantId && restaurantId !== "") {
                let result: any
                result = await reviewAccess.getReviews(restaurantId)
                logger.debug(`RestaurantId: ${restaurantId} Reviews: ${result.Items}`)
                if (result.Items !== undefined && result.Items !== null && result.Items.length !== 0) {
                    try {
                        await this.processDeletedReviews(result.Items)
                        while (result.LastEvaluatedKey !== undefined && result.LastEvaluatedKey !== null) {
                            logger.debug(`LastEvaluatedKey: ${JSON.stringify(result.LastEvaluatedKey)}`)
                            result = await reviewAccess.getReviews(restaurantId, result.LastEvaluatedKey)
                            if (result.Items !== undefined && result.Items !== null)
                                await this.processDeletedReviews(result.Items)
                        }
                    }catch(err){
                        logger.error(`Error deleting reviews: ${JSON.stringify(result.Items)}`)
                        sqsHelper.sendMessageBatch(reviewsQueueUrl, result.Items, false)
                    }  
                }
            }
        }catch(err) {
            logger.error(`Error deleting reviews for restaurant: ${restaurantId}`)
            throw new Error(err);
        }
    }

    async processDeletedReviews(items: any) {
        if(items !== undefined && items !== null && items.length !== 0) {
            try {
                await reviewAccess.deleteReviews(items)
            }catch(err){
                logger.error(`Error deleting reviews ${JSON.stringify(err)}`)
                throw new Error(err)
            }

            try{
                await s3Helper.deleteReviewImages(items)
            }catch(err){
                logger.error(`Error deleting review images ${JSON.stringify(err)}`)
                throw new Error(err)
            }

            try{
                await s3Helper.deleteReviewImages(items, "thumbnails/")
            }catch(err){
                logger.error(`Error deleting thumbnail review images ${JSON.stringify(err)}`)
                throw new Error(err)
            }
        } 
    }

    async processRestaurantErrorQueue() {
        let restaurants
        try {
            let result = await sqsHelper.receiveMessages(restaurantQueueUrl)
            restaurants = await this.mapMsgstoRestaurants(result)
            await this.processDeletedRestaurants(restaurants)
            while(result.QueueDepth > 0) {
                result = await sqsHelper.receiveMessages(restaurantQueueUrl)
                restaurants = await this.mapMsgstoRestaurants(result)
                await this.processDeletedRestaurants(restaurants)
            }
        } catch(err) {
            logger.error(`Error deleting SQS restaurants: ${JSON.stringify(err)}`)
            logger.error(`SQS restaurants: ${JSON.stringify(restaurants)}`)
        }
    }

    async processReviewErrorQueue() {
        let reviews
        try {
            let result = await sqsHelper.receiveMessages(reviewsQueueUrl)
            reviews = await this.mapMsgstoReviews(result)
            await this.processDeletedReviews(reviews)
            while(result.QueueDepth > 0) {
                result = await sqsHelper.receiveMessages(reviewsQueueUrl)
                reviews = await this.mapMsgstoReviews(result)
                await this.processDeletedReviews(reviews)
            }
        } catch(err) {
            logger.error(`Error deleting SQS reviews: ${JSON.stringify(err)}`)
            logger.error(`SQS reviews: ${JSON.stringify(reviews)}`)
        }
    }

    async mapMsgstoRestaurants(result){
        let restaurants
        if (result.Messages !== undefined && result.Messages.length !== 0) {
            let splitString
            restaurants = result.Messages.map(message => {
                splitString = message.split[","]
                if(splitString !== undefined && splitString.length !< 2) {
                    return {
                        cuisineId: splitString[0],
                        restaurantId: splitString[1]
                    }
                } 
            })
        }
        return restaurants
    }

    async mapMsgstoReviews(result){
        let reviews
        if (result.Messages !== undefined && result.Messages.length !== 0) {
            let splitString
            reviews = result.Messages.map(message => {
                splitString = message.split[","]
                if(splitString !== undefined && splitString.length !< 2) {
                    return {
                        restaurantId: splitString[0],
                        reviewId: splitString[1]
                    }
                }
            })
        }
        return reviews
    }
}