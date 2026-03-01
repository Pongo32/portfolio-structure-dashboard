module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        chrome: '69',
        android: '7.0',
        safari: '12'
      },
      useBuiltIns: 'entry',
      corejs: { version: 3, proposals: true },
      modules: false,
      loose: true,
      bugfixes: true,
      shippedProposals: true
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-nullish-coalescing-operator'],
    ['@babel/plugin-proposal-optional-chaining']
  ]
};
