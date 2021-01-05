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
                    ProjectionExpression: "restaurantId, deleted",
                    FilterExpression: 'deleted = :d',
                    ExpressionAttributeValues: {
                        ':d' : true
                    },
                }).promise()
            } else {
                result = await this.docClient.scan({
                    TableName: this.restaurantsTable,
                    ProjectionExpression: "restaurantId, deleted",
                    FilterExpression: 'deleted = :d',
                    ExpressionAttributeValues: {
                        ':d' : true
                    },
                    ExclusiveStartKey: lastEvaluatedKey
                }).promise()
            }
            logger.info(`Result from scan on restaurants table: ${JSON.stringify(result)}`)
            return result
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }
}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient();
}