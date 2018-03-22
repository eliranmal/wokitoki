const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');


let config = {
    entry: {
        background: './src/background/main.js',
        popup: './src/popup/main.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        // publicPath: '/dist/',
        filename: '[name].js',
    },
    devServer: {
        overlay: true,
        historyApiFallback: true,
        port: 9099,
        index: 'popup.html',
        contentBase: path.resolve(__dirname, 'dist'),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    devtool: '#eval-source-map',
    performance: {
        hints: false
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([{
            from: 'manifest.json',
            transform: function (content, path) {
                // enrich the manifest file with package.json information
                return Buffer.from(JSON.stringify({
                    name: process.env.npm_package_name,
                    description: process.env.npm_package_description,
                    version: process.env.npm_package_version,
                    ...JSON.parse(content.toString()),
                }));
            },
        }]),
        new CopyWebpackPlugin([{
            // todo - make a logo-32.png icon for this
            from: 'assets/images/logo-48.png',
            to: 'favicon.ico'
        }]),
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: './popup.html',
            chunks: ['popup'],
        }),
        new HtmlWebpackPlugin({
            filename: 'background.html',
            template: './background.html',
            chunks: ['background'],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [
                    /bootstrap-vue/,
                ],
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.css$/,
                exclude: [
                    /bootstrap-vue/,
                ],
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    require.resolve('bootstrap-vue'),
                ],
                use: 'babel-loader',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]?[hash]',
                        outputPath: 'assets/images/',
                    },
                },
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: 'html-loader',
            },
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
};


if (['production', 'development'].includes(process.env.NODE_ENV)) {
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
    ]);
}

if (process.env.NODE_ENV === 'production') {
    config.devtool = '#source-map';
    config.plugins = (config.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
    ]);
} else if (process.env.NODE_ENV === 'development') {
    config.plugins = (config.plugins || []).concat([
        // tell dev server to persist files - we need to be able to install the extension from the filesystem
        new WriteFileWebpackPlugin(),
    ]);
}

module.exports = config;
