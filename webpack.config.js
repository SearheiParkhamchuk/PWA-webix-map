const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = function (env) {
  const pack = require('./package.json')
  const MiniCssExtractPlugin = require('mini-css-extract-plugin')

  const production = !!(env && env.production === true)
  const asmodule = !!(env && env.module === true)
  const standalone = !!(env && env.standalone === true)

  const babelSettings = {
    extends: path.join(__dirname, '/.babelrc'),
  }

  const config = {
    mode: production ? 'production' : 'development',
    entry: path.resolve(__dirname, './sources/index.js'),
    output: {
      path: path.join(__dirname, './dist'),
      publicPath: production ? './' : '/',
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'babel-loader?' + JSON.stringify(babelSettings),
        },
        {
          test: /\.(svg|png|jpg|gif)$/,
          use: 'url-loader?limit=25000',
        },
        {
          test: /\.(less|css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
        },
      ],
    },
    stats: 'minimal',
    resolve: {
      extensions: ['.js'],
      modules: ['./sources', 'node_modules'],
      alias: {
        'jet-views': path.resolve(__dirname, 'sources/views'),
        'jet-locales': path.resolve(__dirname, 'sources/locales'),
      },
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new webpack.DefinePlugin({
        VERSION: `"${pack.version}"`,
        APPNAME: `"${pack.name}"`,
        PRODUCTION: production,
        BUILD_AS_MODULE: asmodule || standalone,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, './assets'),
            to: 'assets',
            globOptions: {
              ignore: ['*.DS_Store'],
            },
            noErrorOnMissing: true,
          },
          {
            from: path.resolve(__dirname, './manifest.json'),
            to: '.',
          },
          {
            from: path.resolve(__dirname, './serviceWorker.js'),
            to: '.',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        favicon: path.resolve(__dirname, './sources/images/favicon.png'),
        template: path.resolve(__dirname, './sources/index.html'), // template file
        filename: 'index.html', // output file
      }),
    ],
    devServer: {
      client: {
        logging: 'error',
      },
      static: __dirname,
      historyApiFallback: true,
    },
  }

  if (!production) {
    config.devtool = 'inline-source-map'
  }

  if (asmodule) {
    if (!standalone) {
      config.externals = config.externals || {}
      config.externals = ['webix-jet']
    }

    const out = config.output
    const sub = standalone ? 'full' : 'module'

    out.library = pack.name.replace(/[^a-z0-9]/gi, '')
    out.libraryTarget = 'umd'
    out.path = path.join(__dirname, 'dist', sub)
    out.publicPath = '/dist/' + sub + '/'
  }

  return config
}
