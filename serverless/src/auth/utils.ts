import { decode } from 'jsonwebtoken'

import { createLogger } from '../utils/logger'
import { JwtPayload } from './JwtPayload'

const logger = createLogger(`Auth Util`)
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  logger.info(`Parsing User Id from jwt token: ${jwtToken}`)
  let decodedJwt
  try {
    decodedJwt = decode(jwtToken) as JwtPayload
  } catch(err) {
    logger.error('Error parsing User Id', { error: err.message })
    return "";
  } 
  return decodedJwt.sub
}
