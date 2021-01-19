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
        try {
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
        }catch(err) {
            logger.error(`Error deleting restaurants ${JSON.stringify(err)}`)
        }
    }
    
    async processDeletedRestaurants(items: any) {
        if(items !== undefined && items !== null) {
            items.forEach(async restaurant => {
                try {
                    await this.processDeletedRestaurant(restaurant.restaurantId)
                }catch(err) {
                    logger.error(`Error deleting restaurant: ${JSON.stringify(restaurant)}`)
                    //Add it to restaurant error queue
                }
            });
        }
        try {
            await restaurantAccess.deleteRestaurants(items)
        }catch(err) {
            logger.error(`Error deleting restaurants: ${JSON.stringify(items)}`)
            //Add to restaurant error queue
        }
    }

    async processDeletedRestaurant(restaurantId) {
        try {
            if (restaurantId && restaurantId !== "") {
                let result: any
                result = await reviewAccess.getReviews(restaurantId)
                if (result.Items !== undefined && result.Items !== null) {
                    try {
                        await this.processDeleteReviews(result.Items)
                        while (result.LastEvaluatedKey !== undefined && result.LastEvaluatedKey !== null) {
                            logger.info(`LastEvaluatedKey: ${JSON.stringify(result.LastEvaluatedKey)}`)
                            result = await reviewAccess.getReviews(restaurantId, result.LastEvaluatedKey)
                            if (result.Items !== undefined && result.Items !== null)
                                await this.processDeleteReviews(result.Items)
                        }
                    }catch(err){
                        logger.error(`Error deleting reviews: ${JSON.stringify(result.Items)}`)
                        throw new Error(err)
                    }  
                }
            }
        }catch(err) {
            logger.error(`Error deleting reviews for restaurant: ${restaurantId}`)
            throw new Error(err);
        }
    }

    async processDeleteReviews(items: any) {
        if(items !== undefined && items !== null) {
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
        } 
    }
}