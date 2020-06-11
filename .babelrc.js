const isTestEnv = process.env.NODE_ENV === 'test'
const isCJSBuild = process.env.BABEL_BUILD === 'cjs' || isTestEnv

module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        modules: isCJSBuild ? 'commonjs' : false
      }
    ]
  ]
}
