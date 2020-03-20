import * as uuid from 'uuid'

import { createLogger } from '../utils/logger'
import { CuisinesAccess } from '../dataLayer/cuisinesAccess'
import { CreateCuisineRequest } from '../requests/CreateCuisineRequest'
import { CuisineItem } from '../models/CuisineItem'

const logger = createLogger(`CuisinesHelper`)
const cuisinesAccess = new CuisinesAccess()

export class CuisinesHelper {
    async getCuisines()  {
        logger.info('Getting Cuisines from cuisinesAccess')
        let items: any
        try {
            items = await cuisinesAccess.getCuisines()
            logger.info(`Items returned from cuisineAccess: ${JSON.stringify(items)}`)
            return items
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async createCuisine(newCuisine: CreateCuisineRequest) {
        logger.info('Passing new cuisine request to CuisinesAccess')
        const addCuisineItem: CuisineItem = {
            id: uuid.v4(),
            cuisineName: newCuisine.cuisineName
        }
        let item: CuisineItem
        try {
            item = await cuisinesAccess.putCuisine(addCuisineItem)
            logger.info(`Item returned from cuisineAccess: ${JSON.stringify(item)}`)
            return item
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }
}