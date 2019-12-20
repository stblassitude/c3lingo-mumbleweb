module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /node_modules\/mumble-streams\/lib\/data\.js$/,
        loader: 'transform-loader?brfs'
      }
    ]
  }
};
