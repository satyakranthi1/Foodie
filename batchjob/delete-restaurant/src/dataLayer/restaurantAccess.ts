import { createLogger } from "../utils/logger";
import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const config = require('../config.json')
const logger = createLogger(`RestaurantAccess`)

export class RestaurantAccess {
    constructor( private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly restaurantsTable = config.RESTAURANTS_TABLE){}

    async getDeletedRestaurants(lastEvaluatedKey = null) {
        let result: any
        try {
            if(lastEvaluatedKey === null) {
                result = await this.docClient.scan({
                    TableName: this.restaurantsTable,
                    ProjectionExpression: "cuisineId, restaurantId, deleted",
                    FilterExpression: 'deleted = :d',
                    ExpressionAttributeValues: {
                        ':d' : true
                    },
                }).promise()
            } else {
                result = await this.docClient.scan({
                    TableName: this.restaurantsTable,
                    ProjectionExpression: "ciusineId, restaurantId, deleted",
                    FilterExpression: 'deleted = :d',
                    ExpressionAttributeValues: {
                        ':d' : true
                    },
                    ExclusiveStartKey: lastEvaluatedKey
                }).promise()
            }
            logger.debug(`Result from scan on restaurants table: ${JSON.stringify(result)}`)
            return result
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async deleteRestaurants(restaurants) {
        let result: any
        let batchWriteRequests = []
        try {
            let restaurantsCopy = [...restaurants]
            restaurantsCopy.map((restaurant) => {
                batchWriteRequests.push({
                    DeleteRequest: {
                        Key: {
                            cuisineId: restaurant.cuisineId.toString(),
                            restaurantId: restaurant.restaurantId.toString()
                        }
                    }
                })
            })
            logger.debug(`Batch write request created: ${JSON.stringify(batchWriteRequests)}`)

            while(batchWriteRequests.length != 0) {
                let maxBatchWriteRequests;
                if(batchWriteRequests.length < 25) {
                    maxBatchWriteRequests = batchWriteRequests.splice(0, batchWriteRequests.length);
                    logger.debug(`Less than 25 requests. Sending BatchWrite Request ${JSON.stringify(batchWriteRequests)}`)
                } else {
                    maxBatchWriteRequests = batchWriteRequests.splice(0, 24)
                    logger.debug(`25 or more requests. Sending BatchWrite Request ${JSON.stringify(maxBatchWriteRequests)}`)
                }
                try {
                    result = await this.docClient.batchWrite({
                        RequestItems: {
                            [this.restaurantsTable]: maxBatchWriteRequests
                        }
                    }).promise()
                    if(Object.entries(result.UnprocessedItems).length != 0) {
                        logger.debug(`There are unprocessed items: ${JSON.stringify(result.UnprocessedItems)}`)
                        batchWriteRequests.push(result.UnprocessedItems)
                    }
                } catch(err) {
                    logger.error(`BatchWrite threw an error: ${JSON.stringify(err)}`)
                    throw new Error(err)
                }
            }
        }catch(err){
            logger.error('operation threw an error', err)
            throw new Error(err)
        }
    }
}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient();
}