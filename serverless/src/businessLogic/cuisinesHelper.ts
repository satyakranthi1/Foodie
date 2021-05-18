import { createLogger } from '../utils/logger'
import { CuisinesAccess } from '../dataLayer/cuisinesAccess'
import { CreateCuisineRequest } from '../requests/CreateCuisineRequest'
import { CuisineItem } from '../models/CuisineItem'

const logger = createLogger(`CuisinesHelper`)
const cuisinesAccess = new CuisinesAccess()

export class CuisinesHelper {
    async getCuisines(LastEvaluatedKey: any, Limit: any)  {
        logger.info('Getting Cuisines from cuisinesAccess')
        logger.info(`LastEvaluatedKey: ${LastEvaluatedKey}, Limit ${Limit}`)
        let result: any
        try {
            result = await cuisinesAccess.getCuisines(LastEvaluatedKey, Limit)
            logger.info(`result returned from cuisineAccess: ${JSON.stringify(result)}`)
            return result
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async createCuisine(newCuisine: CreateCuisineRequest) {
        logger.info('Passing new cuisine request to CuisinesAccess')
        const addCuisineItem: CuisineItem = {
            id: newCuisine.id,
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