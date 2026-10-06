const express = require('express')
const app = express()
const browserify = require('browserify')
const babelify = require('babelify')
const esmify = require('esmify')
const { devDependencies: plugins } = require('./package')

app.use(express.static('public'))
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', {
    plugins: Object.keys(plugins)
      .filter(dep => dep.startsWith('@citation-js/plugin-'))
      .map(plugin => ({
        name: plugin.slice('@citation-js/plugin-'.length),
        version: plugins[plugin]
      }))
  })
})

app.get('/bundle', (req, res) => {
  let core = 'c' in req.query ? '@citation-js/core' : null
  let replacer = 'r' in req.query ? '@citation-js/replacer' : null
  let babel = 'b' in req.query
  let plugins = req.query.p ? [].concat(req.query.p).map(plugin => `@citation-js/plugin-${plugin}`) : []

  if (!core && !replacer && !plugins.length) {
    res.send('')
  }

  const config = {
    plugin: []
  }

  if (babel) {
    config.plugin.push([esmify, { mainFields: ['browser', 'main', 'module'] }])
  }

  let bundle = browserify(plugins.map(require.resolve))
  if (replacer) bundle.add(require.resolve(replacer))
  if (core) bundle.require(require.resolve(core), { expose: 'citation-js' })

  if (babel) {
    bundle.transform(babelify, {
      global: true,
      presets: [
        ['@babel/env', {
          modules: 'commonjs',
          targets: { browsers: ['> 0.5%', 'last 5 versions', 'ie >= 10'] }
        }]
      ],
      comments: false
    })
  }

  const stream = bundle.bundle()
  stream.on('error', e => { res.status(500).send(e) })
  stream.pipe(res)
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
