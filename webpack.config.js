const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');

module.exports = {
    entry: {
        vendor: Object.keys(pkg.dependencies),
        background: './src/background/main.js',
        popup: './src/popup/main.js',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        // publicPath: '/dist/',
        filename: '[name].js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([{
            from: 'manifest.json',
            transform: function (content, path) {
                // generate the manifest file using the package.json information
                return Buffer.from(JSON.stringify({
                    name: process.env.npm_package_name,
                    description: process.env.npm_package_description,
                    version: process.env.npm_package_version,
                    ...JSON.parse(content.toString()),
                }));
            },
        }]),
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: './popup.html',
            chunks: ['vendor', 'popup'],
        }),
        new HtmlWebpackPlugin({
            filename: 'background.html',
            template: './background.html',
            chunks: ['background'],
        }),
        // // todo - add for webpack-dev-server
        // new WriteFilePlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: 'file-loader?name=[name].[ext]?[hash]&outputPath=assets/images/',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/
            },
        ]
    },
    devServer: {
        // contentBase: path.resolve(__dirname, './src'),
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map';
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
