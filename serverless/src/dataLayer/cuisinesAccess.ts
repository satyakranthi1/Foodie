import { createLogger } from '../utils/logger'

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { CuisineItem } from '../models/CuisineItem'

const logger = createLogger(`CuisinesAccess`)

export class CuisinesAccess {
    constructor(private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly cuisinesTable = process.env.CUISINES_TABLE){}

    async getCuisines(LastEvaluatedKey: any, Limit: any) {
        logger.info(`Getting all cuisines`)
        logger.info(`LastEvaluatedKey: ${LastEvaluatedKey}, Limit${Limit}`)
        let result: any
        try {
            if(LastEvaluatedKey === null ){
                result = await this.docClient.scan({
                    TableName: this.cuisinesTable,
                    Limit
                }).promise()
            } else {
                result = await this.docClient.scan({
                    TableName: this.cuisinesTable,
                    Limit,
                    ExclusiveStartKey: LastEvaluatedKey
                }).promise()
            }
            logger.info(`Result from scan on cuisines table: ${JSON.stringify(result)}`)
            return result
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