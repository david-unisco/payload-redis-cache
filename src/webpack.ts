import path from 'path'
import type { Configuration as WebpackConfig } from 'webpack'

// Note: This webpack configuration is not used in Payload v3
// Keeping it for backward compatibility or potential future use
export const extendWebpackConfig =
  () =>
  (webpackConfig: WebpackConfig): WebpackConfig => {
    const adaptersPath = path.resolve(__dirname, 'adapters')
    const adaptersMock = path.resolve(__dirname, 'mocks')

    const config: WebpackConfig = {
      ...webpackConfig,
      resolve: {
        ...(webpackConfig.resolve || {}),
        alias: {
          ...(webpackConfig.resolve?.alias || {}),
          [adaptersPath]: adaptersMock
        }
      }
    }

    return config
  }
