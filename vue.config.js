const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}
const isProd = true // process.env.NODE_ENV === 'production'
const assetsCDN = {
  // webpack build externals
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios',
    moment: 'moment',
    'ant-design-vue': 'antd',
    '@antv/g2plot': 'G2Plot'
  },
  css: [
    'https://cdn.staticfile.org/ant-design-vue/1.5.6/antd.min.css'
  ],
  js: [
    'https://cdn.staticfile.org/vue/2.6.10/vue.runtime.min.js',
    'https://cdn.staticfile.org/vue-router/3.1.3/vue-router.min.js',
    'https://cdn.staticfile.org/vuex/3.1.1/vuex.min.js',
    'https://cdn.staticfile.org/axios/0.19.1/axios.min.js',
    'https://cdn.staticfile.org/moment.js/1.0.0/moment.min.js',
    'https://cdn.staticfile.org/moment.js/2.9.0/moment-with-locales.min.js',
    'https://cdn.staticfile.org/ant-design-vue/1.5.6/antd.min.js',
    'https://cdn.staticfile.org/ant-design-vue/1.5.6/antd-with-locales.min.js',
    'https://cdn.staticfile.org/g2plot/2.3.20/g2plot.min.js'
  ]
}

// vue.config.js
module.exports = {
  configureWebpack: {
    externals: isProd ? assetsCDN.externals : {},
    resolve: {
      alias: {
        '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/icons.js')
      }
    }
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
    if (process.env.use_analyzer) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
    if (isProd) {
      config.plugin('html').tap(args => {
        args[0].cdn = assetsCDN
        return args
      })
    }
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          /*
          'primary-color': '#F5222D',
          'link-color': '#F5222D',
          'border-radius-base': '4px',
          */
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    // development server port 8000
    port: 9000,
    proxy: {
      '/proxy': {
        target: 'http://localhost:80',
        secure: true,
        changeOrigin: true,
        pathRewrite: {
          '^/proxy': '/'
        }
      }
    }
  },
  // disable source map in production
  productionSourceMap: false,
  lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}
