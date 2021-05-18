import { createLogger } from '../utils/logger'
import { RestaurantsAccess } from '../dataLayer/restaurantsAccess'
import { CreateRestaurantRequest } from '../requests/CreateRestaurantRequest'
import { RestaurantItem } from '../models/RestaurantItem'

const logger = createLogger(`RestaurantsHelper`)
const restaurantsAccess = new RestaurantsAccess()

export class RestaurantsHelper {
    async getRestaurants(cuisineId: string, LastEvaluatedKey: any, Limit: any) {
        logger.info(`CuisineId received ${cuisineId}, LastEvaluatedKey is ${LastEvaluatedKey}, Limit is ${Limit}`)
        try {
            const result = await restaurantsAccess.getRestaurants(cuisineId, LastEvaluatedKey, Limit)
            logger.info(`items returned from restaurantsAccess layer: ${JSON.stringify(result.Items)}`)
            if(result.Items.length !== 0) {
                const filteredItems = result.Items.filter((item) => {
                    if(item && !item.deleted) {
                        return true
                    }
                })
                logger.info(`filtered items: ${JSON.stringify(filteredItems)}`)
                return { items: filteredItems, LastEvaluatedKey: result.LastEvaluatedKey };
            } else {
                return { items: result.Items, LastEvaluatedKey: null };
            }
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async createRestaurant(newRestaurant: CreateRestaurantRequest) {
        logger.info(`Creating new restaurant`)
        let result: any
        const addRestaurantItem: RestaurantItem = {
            ...newRestaurant,
            deleted : false
        }
        try { 
            result = await restaurantsAccess.putRestaurant(addRestaurantItem)
            return result
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async deleteRestaurant(cuisineId: string, restaurantId: string, userId: string) {
        logger.info(`Deleting restaurant with cuisineId: ${cuisineId} for user: ${userId}`)
        let result: any
        try {
            result = await restaurantsAccess.deleteRestaurant(cuisineId, restaurantId, userId)
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            logger.error(`error: ${JSON.stringify(err)}`)
            throw new Error(err)
        }
    } 
}