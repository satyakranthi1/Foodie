import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { CreateCuisineRequest } from '../../requests/CreateCuisineRequest'
import { CuisineItem } from '../../models/CuisineItem'
import { CuisinesHelper } from '../../businessLogic/cuisinesHelper'

const logger = createLogger(`CreateCuisineLambda`)
const cuisinesHelper = new CuisinesHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Handling event: ${JSON.stringify(event)}`)
    const newCuisine: CreateCuisineRequest = JSON.parse(event.body)
    logger.info(`Parsed event body: ${JSON.stringify(newCuisine)}`)
    let addedCuisine: CuisineItem = {
        id: '',
        cuisineName: ''
    }
    let statusCode: number
    let body: string
    try {
        addedCuisine = await cuisinesHelper.createCuisine(newCuisine)
        logger.info(`Added Cuisine Item: ${JSON.stringify(addedCuisine)}`)
        statusCode = 201
        body = JSON.stringify({
            item: {
                id: addedCuisine.id,
                cuisineName: addedCuisine.cuisineName
            }
        })
    } catch(err) {
        logger.error('Cuisine not created', { error: err.message })
        statusCode = 500
        body = ''
    }
    return {
        statusCode,
        headers: {
        'Access-Control-Allow-Origin': '*'
        },
        body 
    }
}