import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager()

const logger = createLogger('auth')

let cachedSecret: string

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  
  let token: string
  try {
    token = getToken(authHeader)
  } catch(ex) {
    throw new Error(ex.message)
  }

  logger.info('Veryfing token')
  
  const secretObject: any = await getSecret()
  const secret = secretObject[secretField]
  let jwtPayload = verify(token, secret, { algorithms: ['RS256'] }) as JwtPayload
  logger.info(`JwtPayload ${JSON.stringify(jwtPayload)}`)
  return jwtPayload
}

async function getSecret() {

  if (cachedSecret) return JSON.parse(cachedSecret)

  const data = await client
    .getSecretValue({
      SecretId: secretId
    }).promise()
    cachedSecret = data.SecretString
    return JSON.parse(cachedSecret)
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}