import path from 'path'

import ExtractTextPlugin from 'extract-text-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import merge from 'webpack-merge'
import webpack from 'webpack'
import WebpackNotifierPlugin from 'webpack-notifier'

const BASE_SETTINGS = {
	entry: {
		main: ['./src/frontend/main.js', './src/frontend/style/main.scss'],
		polyfill: ['core-js/es6/array', 'core-js/es6/object', 'core-js/es6/promise']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'src/public/assets'),
		publicPath: '/assets/',
		chunkFilename: '[name].[id].js'
	},
	resolve: {
		extensions: ['.js', '.vue']
	},
	module: {
		rules: [
			{test: /\.vue$/, loader: 'vue-loader'},
			{test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
			{
				// Sass
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({
					use: ['css-loader', 'postcss-loader', 'sass-loader'],
					fallback: 'style-loader'
				})
			},
			{
				// Images and other shenaniganiganidingdongs
				test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				query: {
					limit: 10000,
					name: '[name].[ext]'
				}
			}
		]
	}
}

const DEV_SETTINGS = {
//	Devtool: 'cheap-module-eval-source-map',
	plugins: [
		new ExtractTextPlugin({
			disable: true // Leave it to hot reloading
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"development"'
			}
		}),
		new webpack.NamedModulesPlugin(),
		new WebpackNotifierPlugin()
	],
	devServer: {
		contentBase: false,
		inline: true,
		hot: true,
		noInfo: true,
		proxy: {
			'/socket.io': { // Must be separate to allow hot reload
				target: 'http://localhost:8000',
				ws: true
			},
			'/': 'http://localhost:8000'
		}
	}
}

const PROD_SETTINGS = {
	output: {
		filename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, 'build/public/assets'),
		chunkFilename: '[name].[id].[chunkhash].js'
	},
	module: {
		rules: [
			{
				// Images and other shenaniganiganidingdongs
				test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				query: {
					limit: 10000,
					name: '[name].[hash:7].[ext]'
				}
			}
		]
	},
	plugins: [
		new ExtractTextPlugin({
			filename: '[name].[contenthash].css'
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new ManifestPlugin({
			basePath: '/assets/',
			fileName: '../manifest.json'
		})
	]
}

export default function ({
	prod = false
} = {}) {
	if (prod) {
		return merge.smart(BASE_SETTINGS, PROD_SETTINGS)
	}
	return merge.smart(BASE_SETTINGS, DEV_SETTINGS)
}
