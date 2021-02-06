import { SQSHelper } from '../queueLayer/sqsHelper'
const assert = require('assert')
const config = require('../config.json')
const restaurantQueueUrl = config.RESTAURANT_ERROR_QUEUE
const reviewQueueUrl = config.REVIEW_ERROR_QUEUE
const sqsHelper = new SQSHelper()
const mockRestaurants = [
    {cuisineId: "1234c", restaurantId: "1234r"}, 
    {cuisineId: "5467c", restaurantId: "5467r"}, 
    {cuisineId: "4321c", restaurantId: "4321r"}
]
const mockReviews = [
    {restaurantId: "1234r", reviewId: "1234r"}, 
    {restaurantId: "5467r", reviewId: "5467r"}, 
    {restaurantId: "4321r", reviewId: "4321r"}
]

describe('SQSHelper', function() {
    describe('sendMessageBatch', function() {
        step('sendRestaurants', function() {
            it('should put messages in Restaurants queue', async function(){
                await sqsHelper.sendMessageBatch(restaurantQueueUrl, mockRestaurants)
            })
        })
        step('sendReviews', function() {
            it('should put messages in reviews queue', async function(){
                await sqsHelper.sendMessageBatch(reviewQueueUrl, mockReviews, false)
            })
        })
    })
    describe('receiveMessage', function() {
        step('receiveRestaurants', function() {
            it('should receive messages from Restaurants queue', async function(){
                await sqsHelper.receiveMessages(restaurantQueueUrl)
            })
        })
        step('receiveReviews', function() {
            it('should receive messages in reviews queue', async function(){
                await sqsHelper.receiveMessages(reviewQueueUrl)
            })
        })
    })
})