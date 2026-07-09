module.exports = {
  hooks: {
    preResolution: (opts) => {
      opts.buildAllowList = ['esbuild', 'sharp']
    }
  }
}
