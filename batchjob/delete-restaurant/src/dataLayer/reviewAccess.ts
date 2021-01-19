import { createLogger } from "../utils/logger";
import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const config = require('../config.json')
const logger = createLogger(`ReviewAccess`)

export class ReviewAccess {
    constructor( private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly reviewsTable = config.REVIEWS_TABLE){}

    async getReviews(restaurantId: string, lastEvaluatedKey = null) {
        logger.info(`restaurantId received is ${restaurantId}`)
        let result: any
        try {
            if(lastEvaluatedKey === null) {
                result = await this.docClient.query({
                    TableName: this.reviewsTable,
                    KeyConditionExpression: 'restaurantId = :restaurantId',
                    ExpressionAttributeValues: {
                        ':restaurantId' : restaurantId
                    },
                    ScanIndexForward: false
                }).promise()
            } else {
                result = await this.docClient.query({
                    TableName: this.reviewsTable,
                    KeyConditionExpression: 'restaurantId = :restaurantId',
                    ExpressionAttributeValues: {
                        ':restaurantId' : restaurantId
                    },
                    ScanIndexForward: false,
                    ExclusiveStartKey: lastEvaluatedKey
                }).promise()
            }
            logger.info(`Result from query on reviews table: ${JSON.stringify(result)}`)
            return result
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async deleteReviews(reviews: any) {
        let result: any
        let batchWriteRequests = []
        try {
            let reviewsCopy = [...reviews]
            reviewsCopy.map((review) => {
                batchWriteRequests.push({
                    DeleteRequest: {
                        Key: {
                            restaurantId: review.restaurantId.toString(),
                            reviewId: review.reviewId.toString()
                        }
                    }
                })
            })
            logger.info(`Batch write request created: ${JSON.stringify(batchWriteRequests)}`)

            while(batchWriteRequests.length != 0) {
                let maxBatchWriteRequests;
                if(batchWriteRequests.length < 25) {
                    maxBatchWriteRequests = batchWriteRequests;
                    logger.info(`Less than 25 requests. Sending BatchWrite Request ${JSON.stringify(batchWriteRequests)}`)
                } else {
                    let maxBatchWriteRequests = batchWriteRequests.splice(0, 24)
                    logger.info(`25 or more requests. Sending BatchWrite Request ${JSON.stringify(maxBatchWriteRequests)}`)
                }
                try {
                    result = await this.docClient.batchWrite({
                        RequestItems: {
                            [this.reviewsTable]: maxBatchWriteRequests
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
        } catch(err) {
            logger.error('operation threw an error', err)
        }
    }

}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient();
}