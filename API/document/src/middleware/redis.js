const { createClient } = require("redis")
const logger = require('../configs/logger')
const crypto = require('crypto')
const config = require('../configs/config')



let redisClient

async function initializeRedisClient() {
    // read the Redis connection URL from the envs
    let redisURL = config.redisURI
    if (redisURL) {
      // create the Redis client object
      redisClient = createClient({ url: redisURL }).on("error", (e) => {
        logger.error(`Failed to create the Redis client with error: ${e}`)
      })
      
      try {
        // connect to the Redis server
        await redisClient.connect()

        logger.info(`Connected to Redis successfully!`)
      } catch (e) {
        logger.error(`Connection to Redis failed with error: ${e}`)

      }
    }
}

function requestToKey(id,path) {
    const reqDataToHash =  id +  path 
    return `${path}-${crypto.hash('sha1',reqDataToHash)}`
  }

async function writeData(key, data, options) {
    try {
        logger.info("Writing data to cache")
        // write data to the Redis cache with options
        if (options != undefined)
                return await redisClient.set(key, data, options)
            
        // write data to the Redis cache without options
        return await redisClient.set(key, data)
        
    } catch (e) {
    logger.error(`Failed to cache data for key=${key}`, e)
    }

}

async function readData(key) {
    let cachedValue = undefined

    // try to get the cached response from redis
    cachedValue = await redisClient.get(key)
    if (cachedValue) 
        return cachedValue
}

async function invalidateCache(key) {
        try {
            await redisClient.del(key)
            //logger.info(`Cache invalidated for key ${key}`)
        } catch (e) {
            logger.error(`Failed to invalidate cache for key=${key}`, e)
        }
}

function redisCacheMiddleware(options) {
    return async (req, res, next) => {
            const key = requestToKey(req.user.coffer_id,req.path)
            const cachedValue = await readData(key)

            if (cachedValue) {
                logger.info(`Cache hit\n\nCache key: ${key}`)
                try {
                    return res.json(JSON.parse(cachedValue))
                } catch (err) {
                    logger.error(`Failed to parse cached data for key=${key}`, err)
                    // Proceed without cache if parsing fails
                    next()
                }
            } else {
                logger.info("Cache miss, proceeding to DB...")
                const resData = res.json

                res.json = function (data) {
                    res.json = resData
                    
                    if (res.statusCode == 200) {
                        logger.info("Caching response...\n")
                        const dataString = JSON.stringify(data)
                        writeData(key, dataString, options) 
                    }

                    return res.json(data)
                }
                next() // Proceed to the next middleware or route handler
            }
         
    }
}






module.exports = {initializeRedisClient,redisCacheMiddleware, invalidateCache, requestToKey}