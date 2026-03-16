import 'iterator-polyfill'
// import configurator from 'core-js/configurator'

const { getPrototypeOf: protoOf } = Object;
const AsyncIteratorPrototype = protoOf(protoOf(protoOf(async function* () { /* empty */ }())))

// configurator({ AsyncIteratorPrototype });

// import 'core-js/actual/async-iterator';

// console.debug(AsyncIteratorPrototype)

// console.debug((async function * () {})())