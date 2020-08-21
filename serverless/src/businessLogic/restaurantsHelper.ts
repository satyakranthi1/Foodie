import { createLogger } from '../utils/logger'
import { RestaurantsAccess } from '../dataLayer/restaurantsAccess'
import { CreateRestaurantRequest } from '../requests/CreateRestaurantRequest'
import { RestaurantItem } from '../models/RestaurantItem'

const logger = createLogger(`RestaurantsHelper`)
const restaurantsAccess = new RestaurantsAccess()

export class RestaurantsHelper {
    async getRestaurants(cuisineId: string) {
        logger.info(`CuisineId received ${cuisineId}`)
        try {
            const items = await restaurantsAccess.getRestaurants(cuisineId)
            logger.info(`items returned from restaurantsAccess layer: ${JSON.stringify(items)}`)
            const filteredItems = items.filter((item) => {
                if(item && !item.deleted) {
                    return true
                }
            })
            logger.info(`items returned from restaurantsAccess layer: ${JSON.stringify(filteredItems)}`)
            return filteredItems
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

    async deleteRestaurant(cuisineId: string, timestamp: string, userId: string) {
        logger.info(`Deleting restaurant with cuisineId: ${cuisineId} for user: ${userId}`)
        let result: any
        try {
            result = await restaurantsAccess.deleteRestaurant(cuisineId, timestamp, userId)
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            logger.error(`error: ${JSON.stringify(err)}`)
            throw new Error(err)
        }
    } 
}