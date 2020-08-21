import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('S3Helper')
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export class S3Helper {
    async GenerateUploadUrl(reviewId: string) {
        try {
            const uploadUrl = s3.getSignedUrl('putObject', {
                Bucket: bucketName,
                Key: reviewId, 
                Expires: urlExpiration
            })
            logger.info(`uploadUrl is ${uploadUrl}`)
            return uploadUrl
        } catch(err) {
            logger.error(`get signed url failed: ${JSON.stringify(err)}`)
            throw new Error('get signed url failed')
        }
    }

    async removeImage(reviewId: string) {
        try {
            await this.deleteObject(reviewId)
        } catch(err) {
            logger.error(`remove image failed: ${JSON.stringify(err)}`)
            throw new Error('remove image failed')
        }
    }

    async deleteObject(reviewId: string) {
        return new Promise(function(resolve, reject) {
            try {
                s3.deleteObject({
                    Bucket: bucketName,
                    Key: reviewId
                }, (err, data) => {
                    if(!data) {
                        throw new Error(err.message)
                    }
                    logger.info(JSON.stringify(data))
                })
                logger.info(`Image deleted for reviewid: ${reviewId}`)
                resolve("done")
            } catch(err) {
                reject(err)
                logger.error(`remove image failed: ${JSON.stringify(err)}`)
            }
        })
    }

    async getImage(reviewId: string) {
        try {
            const s3Object = await s3.getObject({ 
                Bucket: bucketName,
                Key: reviewId
            }).promise()
            return s3Object.Body
        } catch(err) {
            logger.error(`get image failed: ${JSON.stringify(err)}`)
            throw new Error('get image failed')
        } 
    }

    async putImage(imageBuffer: Buffer, reviewId: string) {
        try {
            const key = `thumbnails/${reviewId}`
            await s3.putObject({ 
                Bucket: bucketName,
                Key: key,
                Body: imageBuffer
            }).promise()
            logger.info(`putImage successful Key: ${key}`)
        } catch(err) {
            logger.error(`put image failed: ${JSON.stringify(err)}`)
            throw new Error('put image failed')
        }
    }
}