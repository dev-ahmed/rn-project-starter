var scripts = [
    {
        key: 'postinstall',
        value: 'rndebugger-open'
    },
    {
        key: 'app',
        value: "REACT_DEBUGGER='rndebugger-open --open --port 8081' npm start"
    }
]

module.exports = scripts