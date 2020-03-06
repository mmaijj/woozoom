const webpack = require('webpack')
const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  css: {
    loaderOptions: {
      stylus: {
        'resolve url': true,
        'import': [
          './src/theme'
        ]
      }
    }
  },
  devServer: {
    proxy: {
      /* 测试无人机相关功能 */
      '/a': {
        // target: 'http://172.20.6.10:8180'// 郑世成
        // target: 'http://172.20.6.16:8180'// 王皓
        // target: 'http://172.20.6.15:8182'// 周建超
        // target: 'http://192.168.1.249:12411'// 测试环境
        target: 'http://223.100.24.135:12411'// 测试环境
      },
      '/api': {
        // target: 'http://172.20.6.10:8180'// 郑世成
        // target: 'http://172.20.6.16:8180'// 王皓
        // target: 'http://172.20.6.15:8182'// 周建超
        // target: 'http://192.168.1.249:12411'// 测试环境
        target: 'http://223.100.24.135:12411'// 测试环境
        // bypass: function (req, res) {
        //   debugger
        //   if (req.headers.accept.indexOf('html') !== -1) {
        //     console.log('Skipping proxy for browser request.')
        //     return '/index.html'
        //   } else if (process.env.MOCK !== 'none') {
        //     const name = req.path.split('/api/')[1].split('/').join('_')
        //     const mock = require(`./mock/${name}`)
        //     const result = mock(req.method)
        //     delete require.cache[require.resolve(`./mock/${name}`)]
        //     return res.send(result)
        //   }
        // }
      }
    }
  },
  // 警告 webpack 的性能提示
  configureWebpack: {
    performance: {
      hints: 'warning',
      // 入口起点的最大体积 整数类型（以字节为单位）
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积 整数类型（以字节为单位 300k）
      maxAssetSize: 30000000,
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js')
      }
    }
  },
  pluginOptions: {
    'cube-ui': {
      postCompile: true,
      theme: true
    }
  },
  /* 重新规范路径 */
  chainWebpack (config) {
    config.resolve.alias
      .set('components', resolve('src/components'))
      .set('common', resolve('src/common'))
      .set('views', resolve('src/views'))

    config.plugin('context')
      .use(webpack.ContextReplacementPlugin,
        [/moment[/\\]locale$/, /zh-cn/])
  }
}
