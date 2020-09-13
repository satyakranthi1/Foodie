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

    async updateAttachmentUrl(restaurantId: string, timestamp: string, attachmentUrl: string) {
        logger.info(`Updating review`)
        try {
            await this.docClient
            .update({
                TableName: this.reviewsTable,
                Key: {
                    restaurantId,
                    timestamp
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

    async deleteAllReviews(restaurantId: string) {
        logger.info(`Deleting all reviews for restaurantId: ${restaurantId} `)
        //delete all reviews
        let reviews: any
        // let reviewIdsPromises: any
        let reviewIds: any
        let result: any
        let batchWriteRequests = []
        let tableName = this.reviewsTable
        try {
            reviews = await this.getReviews(restaurantId)
            let reviewsCopy = [...reviews]
            reviewsCopy.map((review) => {
                batchWriteRequests.push({
                    DeleteRequest: {
                        Key: {
                            restaurantId: review.restaurantId.toString(),
                            timestamp: review.timestamp.toString()
                        }
                    }
                })
            })
            logger.info(`Batch write request created: ${JSON.stringify(batchWriteRequests)}`)

            while(batchWriteRequests.length != 0) {
                if(batchWriteRequests.length < 25) {
                    logger.info(`Less than 25 requests. Sending BatchWrite Request ${JSON.stringify(batchWriteRequests)}`)
                    try {
                        result = await this.docClient.batchWrite({
                            RequestItems: {
                                [tableName]: batchWriteRequests
                            }
                        }).promise()
                        if (Object.entries(result.UnprocessedItems).length != 0) {
                            logger.info(`There are unprocessed items: ${JSON.stringify(result.UnprocessedItems)}`)
                            batchWriteRequests = result.UnprocessedItems
                        } else {
                            batchWriteRequests.splice(0, batchWriteRequests.length)
                        }
                    } catch(err) {
                        logger.error(`BatchWrite threw an error: ${JSON.stringify(err)}`)
                    }
                } else {
                    let maxBatchWriteRequests = batchWriteRequests.splice(0, 24)
                    logger.info(`25 or more requests. Sending BatchWrite Request ${JSON.stringify(maxBatchWriteRequests)}`)
                    try {
                        result = await this.docClient.batchWrite({
                            RequestItems: {
                                [tableName]: maxBatchWriteRequests
                            }
                        }).promise()
                        if(Object.entries(result.UnprocessedItems).length != 0) {
                            logger.info(`There are unprocessed items: ${JSON.stringify(result.UnprocessedItems)}`)
                            batchWriteRequests.push(result.UnprocessedItems)
                        }
                    } catch(err) {
                        logger.error(`BatchWrite threw an error: ${JSON.stringify(err)}`)
                    }
                }
            }

            logger.info(`Reviews are: ${JSON.stringify(reviews)}`);
            reviewIds = reviews.map((review) => {
                return review.reviewId
            })
            logger.info(`ReviewIds: ${JSON.stringify(reviewIds)}`)
            const s3DeletePromises = reviewIds.map(async (reviewId) => {
                logger.info(`ReviewId: ${reviewId}`)
                await s3Helper.removeImage(reviewId)
            })
            const s3Delete = await Promise.all(s3DeletePromises)
            logger.info(`Completed S3 Delete Object ${s3Delete}`)
        } catch(err) {
            logger.error('operation threw an error', err)
        }
    }
}

function createDynamoDBClient() {
    const client = new AWS.DynamoDB.DocumentClient();
    AWSXRay.captureAWSClient((client as any).service)
    return client;
}