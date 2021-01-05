//Get messages from queues
//Process any restaurant and review messages
//Get one Restaurant that is deleted
//delete all reviews and then delete restaurant
//any failures go to review error queue or restaurant error queue
//then loop for rest of the restaurants that are deleted
import { RestaurantAccess } from '../dataLayer/restaurantAccess'
import { ReviewAccess } from '../dataLayer/reviewAccess'
import { createLogger } from '../utils/logger'

const logger = createLogger(`DeleteRestaurantProcessor`)
const restaurantAccess = new RestaurantAccess()
const reviewAccess = new ReviewAccess()

export class DeleteRestaurantProcessor {

    async deleteRestaurants() {
        let result: any
        result = await restaurantAccess.getDeletedRestaurants()
        if(result.Items !== undefined && result.Items !== null) {
            await this.processDeletedRestaurants(result.Items)
            while (result.LastEvaluatedKey !== undefined && result.LastEvaluatedKey !== null) {
                logger.info(`LastEvaluatedKey: ${JSON.stringify(result.LastEvaluatedKey)}`)
                result = await restaurantAccess.getDeletedRestaurants(result.LastEvaluatedKey)
                if(result.Items !== undefined && result.Items !== null)
                    await this.processDeletedRestaurants(result.Items)
            }
        }
    }
    
    async processDeletedRestaurants(items: any) {
        if(items !== undefined && items !== null) {
            items.forEach(async restaurant => {
                await this.processDeletedRestaurant(restaurant.restaurantId)
            });
        } 
    }

    async processDeletedRestaurant(restaurantId) {
        if (restaurantId && restaurantId !== "") {
            let result: any
            result = await reviewAccess.getReviews(restaurantId)
            if (result.Items !== undefined && result.Items !== null) {
                await this.processDeleteReviews(result.Items)
                while (result.LastEvaluatedKey !== undefined && result.LastEvaluatedKey !== null) {
                    logger.info(`LastEvaluatedKey: ${JSON.stringify(result.LastEvaluatedKey)}`)
                    result = await reviewAccess.getReviews(restaurantId, result.LastEvaluatedKey)
                    if (result.Items !== undefined && result.Items !== null)
                        await this.processDeleteReviews(result.Items)
                }
            }
        }
        //delete restaurant from dynamo
    }

    async processDeleteReviews(items: any) {
        if(items !== undefined && items !== null) {
            items.forEach(async review => {
                await this.processDeleteReview(review.reviewId)
            });
        } 
    }

    async processDeleteReview(reviewId) {
        if (reviewId && reviewId !== "") {
            //delete review from dynamo
            //delete review photo from s3 if exists
        }
    }
}