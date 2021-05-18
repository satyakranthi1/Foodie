import { createLogger } from '../utils/logger'

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { RestaurantItem } from '../models/RestaurantItem'

const logger = createLogger(`RestaurantAccess`)

export class RestaurantsAccess {
    constructor( private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly restaurantsTable = process.env.RESTAURANTS_TABLE){}
    
    async getRestaurants(cuisineId: string, LastEvaluatedKey: any, Limit: any) {
        logger.info(`cuisineId received is ${cuisineId} LastEvaluatedKey ${LastEvaluatedKey}, Limit is ${Limit}`)
        let result: any
        try {
            if(LastEvaluatedKey === null) {
                result = await this.docClient.query({
                    TableName: this.restaurantsTable,
                    KeyConditionExpression: 'cuisineId = :cuisineId',
                    ExpressionAttributeValues: {
                        ':cuisineId' : cuisineId
                    },
                    Limit,
                    ScanIndexForward: false
                }).promise()
            } else {
                result = await this.docClient.query({
                    TableName: this.restaurantsTable,
                    KeyConditionExpression: 'cuisineId = :cuisineId',
                    ExpressionAttributeValues: {
                        ':cuisineId' : cuisineId
                    },
                    Limit,
                    ScanIndexForward: false,
                    ExclusiveStartKey: LastEvaluatedKey
                }).promise()
            }
            logger.info(`Result from query on restaurants table: ${JSON.stringify(result)}`)
            return result
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async putRestaurant(addRestaurantItem: RestaurantItem) {
        logger.info(`Restaurant item received is ${JSON.stringify(addRestaurantItem)}`)
        try {
            logger.info(`In putRestaurant: TableName: ${this.restaurantsTable} Item: ${JSON.stringify(addRestaurantItem)}`)
            await this.docClient.put({
                TableName: this.restaurantsTable,
                Item: addRestaurantItem
            }).promise()
            return addRestaurantItem
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async deleteRestaurant(cuisineId: string, restaurantId: string, userId: string) {
        logger.info(`Soft deleting restaurant of cuisineId: ${cuisineId} & restaurantId: ${restaurantId} for userId: ${userId}`)
        try {
            await this.docClient.update({
                TableName: this.restaurantsTable,
                Key: {
                    cuisineId: cuisineId,
                    restaurantId: restaurantId
                },
                ConditionExpression: 'userId = :userId',
                UpdateExpression: 'set deleted=:d',
                ExpressionAttributeValues: {
                    ':d': true,
                    ':userId': userId
                }
            }).promise()
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            logger.info(`error: ${JSON.stringify(err)}`)
            throw new Error(err)
        } 
    }
}

function createDynamoDBClient() {
    const client = new AWS.DynamoDB.DocumentClient();
    AWSXRay.captureAWSClient((client as any).service)
    return client;
}