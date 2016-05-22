import path from 'path'

import ExtractTextPlugin from 'extract-text-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import webpack from 'webpack'

export default function ({
	prod = false
} = {}) {
	const outFolder = prod ? path.resolve(__dirname, './build/public/assets') : path.resolve(__dirname, './src/public/assets')

	return {
		entry: {
			main: ['./src/frontend/main.js', './src/frontend/style/main.scss']
		},
		output: {
			filename: prod ? '[name].[chunkhash].bundle.js' : '[name].js',
			path: outFolder,
			publicPath: '/assets/',
			chunkFilename: prod ? '[name].[id].[chunkhash].js' : '[name].[id].js'
		},
		module: {
			loaders: [
				{
					// Vue files
					test: /\.vue$/,
					loader: 'vue'
				},
				{
					// JS
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel'
				},
				{
					// Sass
					test: /\.scss$/,
					// Disable sass minification so css-loader handles it
					loader: prod ? ExtractTextPlugin.extract(['css', 'sass?outputStyle=nested']) : ['style', 'css', 'sass']
				},
				{
					// JaaaaSON
					test: /\.json$/,
					loader: 'json'
				},
				{
					// Images and other shenaniganiganidingdongs
					test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
					loader: 'url',
					query: {
						limit: 10000,
						name: prod ? '[name].[hash:7].[ext]' : '[name].[ext]'
					}
				}
			]
		},
		babel: {
			presets: ['es2015-webpack'],
			plugins: ['transform-runtime']
		},
		plugins: prod ?
			[
				new ManifestPlugin({
					basePath: '/assets/',
					fileName: '../manifest.json'
				}),
				new ExtractTextPlugin('[name].[contenthash].css'),
				new webpack.DefinePlugin({
					'process.env': {
						NODE_ENV: '"production"'
					}
				}),
				new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false
					}
				})
			] : []
	}
}
