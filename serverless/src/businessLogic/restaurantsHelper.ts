import * as uuid from 'uuid'

import { createLogger } from '../utils/logger'
import { RestaurantsAccess } from '../dataLayer/restaurantsAccess'
import { CreateRestaurantRequest } from '../requests/CreateRestaurantRequest'
import { RestaurantItem } from '../models/RestaurantItem'
import { ReviewsAccess } from '../dataLayer/reviewsAccess'

const logger = createLogger(`RestaurantsHelper`)
const restaurantsAccess = new RestaurantsAccess()
const reviewsAccess = new ReviewsAccess()

export class RestaurantsHelper {
    async getRestaurants(cuisineId: string) {
        logger.info(`CuisineId received ${cuisineId}`)
        let items: any
        try {
            items = restaurantsAccess.getRestaurants(cuisineId)
            logger.info(`items returned from restaurantsAccess layer: ${JSON.stringify(items)}`)
            return items
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async createRestaurant(newRestaurant: CreateRestaurantRequest, userId: string) {
        logger.info(`Creating new restaurant`)
        let result: any
        const timestamp = new Date().toISOString()
        const restaurantId = uuid.v4()
        const addRestaurantItem: RestaurantItem = {
            ...newRestaurant,
            timestamp,
            restaurantId,
            userId
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
            logger.info(`Restaurant deleted ${JSON.stringify(result.Attributes.restaurantId)}`)
            logger.info(`Result from delete restaurant ${JSON.stringify(result)}`)
            await reviewsAccess.deleteAllReviews(result.Attributes.restaurantId)
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            logger.error(`error: ${JSON.stringify(err)}`)
            throw new Error(err)
        }
    } 
}