import { S3Handler, S3Event } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { ThumbnailHelper } from '../../businessLogic/thumbnailHelper'

const logger = createLogger(`CreateThumbnailLambda`)
const thumbnailHelper = new ThumbnailHelper()

export const handler: S3Handler = async (event: S3Event) => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    for (const record of event.Records) {
        const key = record.s3.object.key
        if(!key.includes('thumbnails', 0)){
            logger.info(`Processing S3 item with key: ${key}`);
            try {
                await thumbnailHelper.getThumbnail(key);
            } catch(err) {
                logger.error(`get thumbnail failed: ${JSON.stringify(err)}`)
            }
        }
    }
}