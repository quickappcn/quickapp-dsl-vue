/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import base from './base'

export const config = {
  name: 'system.router',
  methods: [
    // Method
    {
      name: 'push',
      type: 0,
      mode: 0
    },
    {
      name: 'replace',
      type: 0,
      mode: 0
    },
    {
      name: 'back',
      type: 0,
      mode: 0
    }
  ]
}

const moduleOwn = Object.assign(
  {
    name: 'system.router',

    push(options) {},

    replace(options) {},

    back() {}
  },
  base
)

export default moduleOwn
