const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  mode: 'production',
  entry: {
    bundle: path.resolve(__dirname, 'app/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'static/js/[name].js',
    clean: true,
  },
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 512000,
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'build'),
    },
    watchFiles: path.join(__dirname, 'public'),
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    client: {
      logging: 'none',
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:5000',
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.(css|scss|sass)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
        },
      },
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]',
        },
      },
      {
        test: /\.(woff|ttf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]',
        },
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
          {
            loader: '@svgr/webpack',
            options: { babel: false },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'app/components'),
      pages: path.resolve(__dirname, 'app/pages'),
      hooks: path.resolve(__dirname, 'app/hooks'),
      services: path.resolve(__dirname, 'app/services'),
      utils: path.resolve(__dirname, 'app/utils'),
      constants: path.resolve(__dirname, 'app/constants'),
      assets: path.resolve(__dirname, 'app/assets'),
      locale: path.resolve(__dirname, 'app/locale'),
    },
    extensions: ['.*', '.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
    }),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './public/index.html',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public', 'favicon.ico'),
          to: path.resolve(__dirname, 'build'),
        },
        {
          from: path.resolve(__dirname, 'public', 'apple-touch-icon.png'),
          to: path.resolve(__dirname, 'build'),
        },
        {
          from: path.resolve(__dirname, 'public', 'robots.txt'),
          to: path.resolve(__dirname, 'build'),
        },
        {
          from: path.resolve(__dirname, 'public', 'uploads'),
          to: path.resolve(__dirname, 'build', 'static'),
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};
