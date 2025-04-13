const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development', // Use 'production' for builds
    entry: './src/index.js', // Entry point of your React app
    output: {
        path: path.resolve(__dirname, 'build'), // Output directory for bundled code
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/, // Transpile JS and JSX files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/, // Handle CSS files
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'], // Allow importing without extensions
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Use your HTML template
        }),
    ],
    devServer: { // Configuration for the development server
        static: {
          directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000, // Port for the dev server (must match main.js)
        hot: true, // Enable Hot Module Replacement
    },
    target: 'electron-renderer', // Important: Target Electron's renderer process
};