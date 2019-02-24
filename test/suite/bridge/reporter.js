/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

/* eslint-disable */

const mocha = require('mocha')
module.exports = Reporter

function Reporter(runner) {
  mocha.reporters.Spec.call(this, runner)

  runner.on('pass', function(test) {
    var fmt
    if (test.speed === 'fast') {
      fmt = indent() + color('checkmark', '  ' + Base.symbols.ok) + color('pass', ' %s')
      console.log(fmt, test.title)
    } else {
      fmt =
        indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s') +
        color(test.speed, ' (%dms)')
      console.log(fmt, test.title, test.duration)
    }
  })
}

mocha.utils.inherits(Reporter, mocha.reporters.Spec)
