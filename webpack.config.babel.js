/* eslint-env node */
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { DefinePlugin } from 'webpack';
import { generate } from 'build-number-generator';
import pkg from './package.json';

export default (env, argv) => {
  const plugins = [];

  let target = 'local';
  if (env && env.target) {
    target = env.target;
  }

  const { version } = pkg;
  const buildNumber = generate({
    version,
    versionSeparator: '-'
  });
  plugins.push(
    new DefinePlugin({
      APEX_VERSION: JSON.stringify(target === 'prod' ? version : buildNumber)
    })
  );

  if (env && env['run-analyzer']) {
    plugins.push(
      new BundleAnalyzerPlugin({
        defaultSizes: 'stat',
        generateStatsFile: true
      })
    );
  }

  const webpackConfig = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
      apex: ['./src/index.js']
    },
    output: {
      path: path.resolve(__dirname, argv.mode === 'production' ? 'dist' : 'build'),
      publicPath: '/',
      filename: '[name].js'
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'www'),
      watchContentBase: true,
      open: true,
      port: 9000
    },
    resolve: {
      modules: [path.resolve(__dirname), 'node_modules']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        },
        {
          test: /\.svg/,
          use: {
            loader: 'svg-url-loader',
            options: {
              encoding: 'base64'
            }
          }
        }
      ]
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true
        })
      ]
    },
    plugins
  };

  if (/^(dev|qa|prod)$/.test(target)) {
    console.log('Build target:', target); // eslint-disable-line no-console
    webpackConfig.resolve.alias = {
      '@rubicon/apex2-config': `@rubicon/apex2-config/config.${target}`
    };
    webpackConfig.output.path = path.resolve(webpackConfig.output.path, target);
    webpackConfig.entry[`apex-${version}`] = ['./src/index.js']; // create versioned
    delete webpackConfig.devtool;
  }
  return webpackConfig;
};
