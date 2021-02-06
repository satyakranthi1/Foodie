import { DeleteRestaurantProcessor } from './businessLogic/deleteRestaurantProcessor'
import { createLogger } from './utils/logger'

const logger = createLogger(`DeleteRestaurantApp`)
logger.info(`Started Delete Restaurant App`)
const deleteRestaurantProcessor = new DeleteRestaurantProcessor()
logger.info(`Running delete restaurant processor`)
deleteRestaurantProcessor.deleteRestaurants()