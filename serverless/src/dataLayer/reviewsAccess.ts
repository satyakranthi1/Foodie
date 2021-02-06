import { createLogger } from '../utils/logger'
import { ReviewItem } from '../models/ReviewItem'

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { S3Helper } from '../businessLogic/s3Helper'

const logger = createLogger(`ReviewsAccess`)
const s3Helper = new S3Helper()

export class ReviewsAccess {
    constructor( private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly reviewsTable = process.env.REVIEWS_TABLE){}
    
    async getReviews(restaurantId: string) {
        logger.info(`restaurantId received is ${restaurantId}`)
        let result: any
        try {
            result = await this.docClient.query({
                TableName: this.reviewsTable,
                KeyConditionExpression: 'restaurantId = :restaurantId',
                ExpressionAttributeValues: {
                    ':restaurantId' : restaurantId
                },
                ScanIndexForward: false
            }).promise()
            logger.info(`Result from query on reviews table: ${JSON.stringify(result)}`)
            const items = result.Items
            logger.info(`Items from result: ${JSON.stringify(items)}`)
            return items
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async putReview(addReviewItem: ReviewItem) {
        logger.info(`Review item received is ${JSON.stringify(addReviewItem)}`)
        try {
            await this.docClient.put({
                TableName: this.reviewsTable,
                Item: addReviewItem
            }).promise()
            return addReviewItem
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async updateAttachmentUrl(restaurantId: string, reviewId: string, attachmentUrl: string) {
        logger.info(`Updating review`)
        try {
            await this.docClient
            .update({
                TableName: this.reviewsTable,
                Key: {
                    restaurantId,
                    reviewId
                },
                UpdateExpression: "set attachmentUrl=:a",
                ExpressionAttributeValues: {
                    ":a": attachmentUrl
                }
            }).promise()
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async isUserReview(userId: string, restaurantId: string, reviewId: string) {
        logger.info(`In function is user review`)
        let result: any
        try {
            result = await this.docClient.query({
                TableName: this.reviewsTable,
                KeyConditionExpression: 'restaurantId = :restaurantId AND reviewId = :reviewId AND userId = :userId',
                ExpressionAttributeValues: {
                    ':restaurantId' : restaurantId,
                    ':reviewId' : reviewId,
                    ':userId' : userId
                },
                ScanIndexForward: false
            }).promise()
            if (result) {
                return true;
            } else {
                return false;
            }
        } catch(err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }
}

function createDynamoDBClient() {
    const client = new AWS.DynamoDB.DocumentClient();
    AWSXRay.captureAWSClient((client as any).service)
    return client;
}