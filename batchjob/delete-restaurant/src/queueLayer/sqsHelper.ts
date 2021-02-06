import { createLogger } from "../utils/logger"
import * as AWS  from 'aws-sdk'
import { SendMessageBatchRequestEntry, DeleteMessageBatchRequestEntry } from "aws-sdk/clients/sqs";

const logger = createLogger('SQSHelper')
const sqs = new AWS.SQS();

export class SQSHelper {

    async sendMessageBatch(queueUrl: string, items: any, restaurant = true) {
        let result
        let messageDictionary = {}
        logger.info(`Queue Url: ${queueUrl}`)
        logger.debug(`Items: ${JSON.stringify(items)}`)
        const entries: SendMessageBatchRequestEntry[]  = items.map( item => {
            if (restaurant) {
                messageDictionary[item.restaurantId] = item.cusineId
                return {
                    Id: item.restaurantId,
                    MessageBody: `${item.cuisineId},${item.restaurantId}`
                }
            } else {
                messageDictionary[item.reviewId] = item.restaurantId
                return {
                    Id: item.reviewId,
                    MessageBody: `${item.restaurantId},${item.reviewId}`
                }
            }
        })
        while(entries.length !== 0) {
            let maxEntries;
            if (entries.length <= 1000){
                maxEntries = entries.splice(0, entries.length)
                logger.debug(`entries length is less than 1000`)
            } else {
                maxEntries = entries.splice(0, 999)
            }

            try {
                result = await sqs.sendMessageBatch({
                    QueueUrl: queueUrl,
                    Entries: maxEntries
                }).promise()
                logger.debug(`Result of SQS SendMessageBatch: ${JSON.stringify(result)}`)
                if(result.Failed.length !== 0) {
                    result.Failed.map(msg => restaurant 
                        ?
                        entries.push({
                            Id: msg.Id,
                            MessageBody: `${messageDictionary[msg.Id]},${msg.Id}`
                        })
                        :
                        entries.push({
                            Id: msg.Id,
                            MessageBody: `${messageDictionary[msg.Id]},${msg.Id}`
                        })
                    )
                }
            } catch(err) {
                logger.error(`Error occured putting messages to sqs: ${JSON.stringify(err)}`)
            }
        }
    }

    async receiveMessages(queueUrl: string) {
        logger.info(`Queue Url: ${queueUrl}`)
        let queueDepthResult
        let messages = []
        try {
            queueDepthResult = await sqs.getQueueAttributes({
                QueueUrl: queueUrl,
                AttributeNames: ["ApproximateNumberOfMessages"]
            }).promise()
            logger.debug(`Queue depth: ${queueDepthResult.Attributes["ApproximateNumberOfMessages"]}`)
            if(queueDepthResult.Attributes["ApproximateNumberOfMessages"] > 0) {
                let result = await sqs.receiveMessage({
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 10
                }).promise()
                logger.debug(`Result is ${JSON.stringify(result.Messages)}`)
                if(result !== undefined && result.Messages !== undefined && result.Messages.length !== 0) {
                    logger.debug(`There are messages`)
                    result.Messages.map(message => {
                        logger.debug(`Pushing message to messages ${JSON.stringify(message.Body)}`)
                        messages.push(message.Body)
                    })
                    await this.deleteMessageBatch(queueUrl, result.Messages)
                }
                queueDepthResult = await sqs.getQueueAttributes({
                    QueueUrl: queueUrl,
                    AttributeNames: ["ApproximateNumberOfMessages"]
                }).promise()
                logger.debug(`New queue depth ${queueDepthResult.Attributes["ApproximateNumberOfMessages"]}`)
            }
            logger.debug(`Messages received: ${JSON.stringify(messages)}`)
            return { Messages: messages, QueueDepth: queueDepthResult.Attributes["ApproximateNumberOfMessages"] }
        } catch(err) {
            logger.error(`Error receiving messages from SQS. ${JSON.stringify(err)}`)
            throw new Error(err)
        }
    }

    async deleteMessageBatch(queueUrl, messages) {
        let maxDeleteMessages: DeleteMessageBatchRequestEntry[]
        let result
        const deleteMessages = messages.map(msg => {
            return {
                Id: msg.MessageId,
                ReceiptHandle: msg.ReceiptHandle
            }
        })
        while (deleteMessages.length !== 0) {
            if (messages.length <= 10) {
                maxDeleteMessages = deleteMessages.splice(0, deleteMessages.length)
            } else {
                maxDeleteMessages = messages.splice(0, 9)
            }
        }
        try {
            logger.debug(`Max delete messages: ${JSON.stringify(maxDeleteMessages)}`)
            result = await sqs.deleteMessageBatch({
                QueueUrl: queueUrl,
                Entries: maxDeleteMessages
            }).promise()
            logger.debug(`Delete messages success result: ${JSON.stringify(result.Successful)}`)
            logger.debug(`Delete messages failed result: ${JSON.stringify(result.Failed)}`)
        } catch(err) {
            logger.error(`Error deleting messages from SQS. ${JSON.stringify(err)}`)
            throw new Error(err)
        }
    }
}