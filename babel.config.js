module.exports = (api) => {
  api.cache(true);
  const presetEnv = {
    targets: {
      browsers: ['>0.25%', 'not ie 11', 'not op_mini all']
    }
  };
  return {
    presets: [
      ['@babel/preset-env', presetEnv]
    ],
    plugins: ['@babel/transform-runtime']
  };
};
