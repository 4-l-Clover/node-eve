// Node Modules
const path = require('path');

// Webpack Plugins
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');



module.exports = {
    mode: 'production',

    entry: {
        app: path.resolve(__dirname, 'src', 'index.js')
    },

    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'build')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin('build')
    ],

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: false,
                uglifyOptions: {
                    ecma: 8,
                    compress: true,
                    output: {
                        comments: false,
                        beautify: false,
                    }
                }
            })
        ]
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        compress: true,
        port: 3000
    }
};