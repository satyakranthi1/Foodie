import { createLogger } from '../utils/logger'

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { CuisineItem } from '../models/CuisineItem'

const logger = createLogger(`CuisinesAccess`)

export class CuisinesAccess {
    constructor(private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly cuisinesTable = process.env.CUISINES_TABLE){}

    async getCuisines() {
        logger.info(`Getting all cuisines`)
        let result: any
        try {
            result = await this.docClient.scan({
                TableName: this.cuisinesTable
            }).promise()
            logger.info(`Result from scan on cuisines table: ${JSON.stringify(result)}`)
            const items = result.Items
            logger.info(`Items from the result of scan: ${JSON.stringify(items)}`)
            return items
        } catch (err) {
            logger.error('operation threw an error', { error: err.message })
            throw new Error(err)
        }
    }

    async putCuisine(addCuisineItem: CuisineItem) {
        logger.info(`Put new cuisine: ${JSON.stringify(addCuisineItem)}`)
        try {
            await this.docClient.put({
                TableName: this.cuisinesTable,
                Item: addCuisineItem
            }).promise()
            return addCuisineItem
        } catch (err) {
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