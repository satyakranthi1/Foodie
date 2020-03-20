import { APIGatewayProxyEvent } from "aws-lambda";

import { createLogger } from '../utils/logger'
import { parseUserId } from "../auth/utils";

const logger = createLogger(`Lambda Util`)
/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  logger.info(`Getting User Id for event: ${JSON.stringify(event)}`)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}