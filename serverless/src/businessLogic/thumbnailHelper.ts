import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { S3Helper } from './s3Helper'
import * as Jimp  from 'jimp'

const bucketName = process.env.IMAGES_S3_BUCKET
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('ThumbnailHelper')
const s3Helper = new S3Helper();

export class ThumbnailHelper {
    async getThumbnail(reviewId: string) {
        logger.info(`ReviewId received : ${reviewId}`)
        try {
            const s3ObjectBody = await s3Helper.getImage(reviewId);
            const buffer = s3ObjectBody as Buffer
            const image = await Jimp.read(buffer)
            const thumbnailBuffer = await image
                .resize(150, 150)
                .quality(60)
                .getBufferAsync(Jimp.MIME_JPEG)    
            await s3Helper.putImage(thumbnailBuffer, reviewId)
        }catch(err) {
            logger.error(`get thumbnail failed: ${JSON.stringify(err)}`)
            throw new Error('get thumbnail failed')
        }
    }
}