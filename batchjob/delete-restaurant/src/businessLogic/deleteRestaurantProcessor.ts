//Get messages from queues
//Process any restaurant and review messages
//Get one Restaurant that is deleted
//delete all reviews and then delete restaurant
//any failures go to review error queue or restaurant error queue
//then loop for rest of the restaurants that are deleted
//Add try catch blocks
import { RestaurantAccess } from '../dataLayer/restaurantAccess'
import { ReviewAccess } from '../dataLayer/reviewAccess'
import { S3Helper } from '../s3Layer/s3Helper'
import { createLogger } from '../utils/logger'

const logger = createLogger(`DeleteRestaurantProcessor`)
const restaurantAccess = new RestaurantAccess()
const reviewAccess = new ReviewAccess()
const s3Helper = new S3Helper()

export class DeleteRestaurantProcessor {

    async deleteRestaurants() {
        //Process restaurants error queue
        //Process reviews error queue
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
        await restaurantAccess.deleteRestaurants(items)
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
    }

    async processDeleteReviews(items: any) {
        if(items !== undefined && items !== null) {
            await reviewAccess.deleteReviews(items)
            await s3Helper.deleteReviewImages(items)
        } 
    }
}