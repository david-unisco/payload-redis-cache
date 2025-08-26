import type { Config, Plugin, CollectionConfig, GlobalConfig } from 'payload'
import { initRedisContext } from './adapters/redis'
import { invalidateCacheAfterChangeHook, invalidateCacheAfterDeleteHook } from './hooks'
import { PluginOptions, RedisInitOptions } from './types'

export const initRedis = (params: RedisInitOptions) => {
  const {
    redisUrl: url,
    redisNamespace: namespace = 'payload',
    redisIndexesName: indexesName = 'payload-cache-index'
  } = params
  initRedisContext({ url, namespace, indexesName })
}

export const cachePlugin =
  (pluginOptions: PluginOptions): Plugin =>
  (config: Config): Config | Promise<Config> => {
    const includedCollections: string[] = []
    const includedGlobals: string[] = []
    // Merge incoming plugin options with the default ones
    const { excludedCollections = [], excludedGlobals = [] } = pluginOptions

    const collections = config?.collections
      ? config.collections?.map((collection): CollectionConfig => {
          const { hooks } = collection

          if (!excludedCollections.includes(collection.slug)) {
            includedCollections.push(collection.slug)
          }

          const afterChange = [...(hooks?.afterChange || []), invalidateCacheAfterChangeHook]
          const afterDelete = [...(hooks?.afterDelete || []), invalidateCacheAfterDeleteHook]

          return {
            ...collection,
            hooks: {
              ...hooks,
              afterChange,
              afterDelete
            }
          }
        })
      : []

    const globals = config?.globals
      ? config.globals?.map((global): GlobalConfig => {
          const { hooks } = global

          if (!excludedGlobals.includes(global.slug)) {
            includedGlobals.push(global.slug)
          }

          const afterChange = [...(hooks?.afterChange || []), invalidateCacheAfterChangeHook]

          return {
            ...global,
            hooks: {
              ...hooks,
              afterChange
            }
          }
        })
      : []

    return {
      ...config,
      collections,
      globals
    }
  }
