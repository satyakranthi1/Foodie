import { createLogger } from "../utils/logger";
import * as AWS  from 'aws-sdk'

const config = require('../config.json')
const logger = createLogger('S3Helper')
const bucketName = config.IMAGES_S3_BUCKET

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

export class S3Helper {

    async deleteReviewImages(reviews: any) {
        let result;
        const deleteObjects = reviews.map(review => { Key: review.reviewId })
        logger.info(`Delete objects created: ${JSON.stringify(deleteObjects)}`)
        while(deleteObjects.length != 0) {
            let maxDeleteObjects;
            if(deleteObjects.length <= 1000) {
                maxDeleteObjects = deleteObjects;
                logger.info(`deleteObjects length is less than 1000`)
            } else {
                maxDeleteObjects = deleteObjects.splice(0, 999)
            }
            try {
                result = await s3.deleteObjects({
                    Bucket: bucketName,
                    Delete: { Objects: maxDeleteObjects, Quiet: true }
                }).promise()
                if(result.Errors.length != 0) {
                    result.Errors.map(err => {
                        logger.error(`Error deleting key: ${err.Key}`)
                        //Add to error queue
                    })
                }
            } catch(err) {
                logger.error(`Error occured deleting review images: ${JSON.stringify(err)}`)
            }
        }
    }
}