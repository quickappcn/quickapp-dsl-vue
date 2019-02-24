/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import base from './base'

export const config = {
  name: 'system.canvas',
  methods: [
    {
      name: 'enable',
      type: 0,
      mode: 0
    },
    {
      name: 'setContextType',
      type: 0,
      mode: 0
    }
  ]
}

const moduleOwn = Object.assign(
  {
    name: 'system.canvas',

    enable(options = {}) {
      return this.mockSync(options._data, options._code)
    },

    setContextType(options = {}) {
      return this.mockSync(options._data, options._code)
    }
  },
  base
)

export default moduleOwn
