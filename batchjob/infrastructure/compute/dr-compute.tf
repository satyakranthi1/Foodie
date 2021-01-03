provider "aws" {
    region = "us-east-2"
}

resource "aws_iam_role" "drc_role" {
  name = "drc_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = {
      tag-key = "DeleteRestaurant"
  }
}

resource "aws_iam_instance_profile" "drc_profile" {
  name = "drc_profile"
  role = aws_iam_role.drc_role.name
}

resource "aws_iam_role_policy" "drc_policy" {
  name = "drc_policy"
  role = aws_iam_role.drc_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::foodie-images-spenu-dev"
    },
    {
        "Action": [
            "dynamodb:Query",
            "dynamodb:DeleteItem",
            "dynamodb:BatchWriteItem"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:us-east-2:498985080589:table/Reviews-dev"
    },
    {
        "Action": [
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:DeleteItem",
            "dynamodb:BatchWriteItem"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:us-east-2:498985080589:table/Restaurants-dev"
    },
    {
        "Action": [
            "sqs:ReceiveMessage",
            "sqs:SendMessage",
            "sqs:SendMessageBatch",
            "sqs:DeleteMessage",
            "sqs:DeleteMessageBatch"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:sqs:us-east-2:498985080589:restaurant-error-queue"
    },
    {
        "Action": [
            "sqs:ReceiveMessage",
            "sqs:SendMessage",
            "sqs:SendMessageBatch",
            "sqs:DeleteMessage",
            "sqs:DeleteMessageBatch"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:sqs:us-east-2:498985080589:review-error-queue"
    }
  ]
}
EOF
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "dr_compute" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
    iam_instance_profile = aws_iam_instance_profile.drc_profile.name
  tags = {
    App = "DeleteRestaurant"
  }
}