const express = require('express')
const app = express()
const browserify = require('browserify')
const spawn = require('child_process').spawn
const {devDependencies: plugins} = require('./package')

app.use(express.static('public'))
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { plugins: Object.keys(plugins).filter(dep => dep.startsWith('@citation-js/plugin-')) })
})

app.get('/bundle', (req, res) => {
  let core = 'c' in req.query ? '@citation-js/core' : null
  let plugins = req.query.p ? req.query.p.map(plugin => `@citation-js/plugin-${plugin}`) : []

  if (!core && !plugins.length) {
    res.send('')
  }

  let bundle = browserify(plugins.map(require.resolve))
  if (core) bundle.require(require.resolve(core), { expose: 'citation-js' })

  bundle.bundle().pipe(res)
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
