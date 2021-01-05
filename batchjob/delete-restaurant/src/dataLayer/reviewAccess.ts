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

}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient();
}