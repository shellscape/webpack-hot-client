const stringify = require('json-stringify-safe');
const { v4: uuid } = require('uuid');
const { DefinePlugin } = require('webpack');

const HotClientError = require('./HotClientError');

function addEntry(entry, compilerName, options) {
  const clientEntry = [`webpack-hot-client/client?${compilerName || uuid()}`];
  let newEntry = {};
  if (!Array.isArray(entry) && typeof entry === 'object') {
    const keys = Object.keys(entry);
    const [first] = keys;

    for (const entryName of keys) {
      const oldImports = entry[entryName].import;
      let newImports = [];
      newEntry[entryName] = Object.create(null);
      if (options.allEntries) {
        newImports = clientEntry.concat(oldImports);
      } else if (entryName === first) {
        newImports = clientEntry.concat(oldImports);
      } else {
        newImports = oldImports;
      }
      newEntry[entryName].import = newImports;
    }
  } else {
    newEntry = {
      import: clientEntry.concat(entry)
    };
  }

  return newEntry;
}

function hotEntry(compiler, options) {
  return options.validTargets.includes(compiler.options.target);
}

function validateEntry(entry) {
  const type = typeof entry;
  const isArray = Array.isArray(entry);

  if (type !== 'function') {
    if (!isArray && type !== 'object') {
      throw new TypeError(
        'webpack-hot-client: The value of `entry` must be an Array, Object, or Function. Please check your webpack config.'
      );
    }

    if (!isArray && type === 'object') {
      for (const key of Object.keys(entry)) {
        const value = entry[key].import;
        if (!Array.isArray(value)) {
          throw new TypeError(
            'webpack-hot-client: `entry` Object values must be an Array or Function. Please check your webpack config.'
          );
        }
      }
    }
  }

  return true;
}

function validateCompiler(compiler) {
  for (const comp of [].concat(compiler.compilers || compiler)) {
    const { entry, plugins } = comp.options;
    validateEntry(entry);

    const pluginExists = (plugins || []).some(
      (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
    );

    if (!pluginExists) {
      throw new HotClientError(
        'HotModuleReplacementPlugin is not found in compiler. Please add an instance of HotModuleReplacementPlugin to your config before proceeding.'
      );
    }
  }

  return true;
}

module.exports = {
  addEntry,
  hotEntry,
  validateEntry,
  modifyCompiler(compiler, options) {
    for (const comp of [].concat(compiler.compilers || compiler)) {
      // since there's a baffling lack of means to un-tap a hook, we have to
      // keep track of a flag, per compiler indicating whether or not we should
      // add a DefinePlugin before each compile.
      comp.hotClient = { optionsDefined: false };

      comp.hooks.beforeCompile.tap('WebpackHotClient', () => {
        if (!comp.hotClient.optionsDefined) {
          comp.hotClient.optionsDefined = true;

          // we use the DefinePlugin to inject hot-client options into the
          // client script. we only want this to happen once per compiler. we
          // have to do it in a hook, since the port may not be available before
          // the server has finished listening. compiler's shouldn't be run
          // until setup in hot-client is complete.
          const definePlugin = new DefinePlugin({
            __hotClientOptions__: stringify(options)
          });
          options.log.info('Applying DefinePlugin:__hotClientOptions__');
          definePlugin.apply(comp);
        }
      });

      if (options.autoConfigure) {
        if (hotEntry(compiler, options)) {
          const config = comp.options;
          const { entry } = config;
          let newEntry;
          if (typeof entry === 'function') {
            newEntry = () =>
              Promise.resolve(entry()).then((_entry) => addEntry(_entry), comp.name, options);
          } else {
            newEntry = addEntry(entry, comp.name, options);
          }
          config.entry = newEntry;

          comp.hooks.entryOption.call(config.context, config.entry);
        }

        validateCompiler(compiler);
      }
    }
  },
  validateCompiler
};
