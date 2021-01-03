provider "aws" {
    region = "us-east-2"
}

resource "aws_sqs_queue" "restaurant_error_queue" {
  name                      = "restaurant-error-queue"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 172800
  receive_wait_time_seconds = 10

  tags = {
    App = "DeleteRestaurant",
    Name= "RestaurantErrorQueue"
  }
}

resource "aws_sqs_queue" "review_error_queue" {
  name                      = "review-error-queue"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 172800
  receive_wait_time_seconds = 10

  tags = {
    App = "DeleteRestaurant",
    Name= "ReviewErrorQueue"
  }
}