/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import base from './base'

export const config = {
  name: 'service.ad',
  methods: [
    // Method
    {
      name: 'createBannerAd',
      type: 0,
      mode: 0
    }
  ]
}

let instId = 0

const moduleOwn = Object.assign(
  {
    name: 'service.ad',

    createBannerAd(options = {}) {
      options._data = options._data || {}
      options._data.instId = ++instId
      options._data.name = 'service.bannerAd'
      options._data._nativeType = 0

      return this.mockSync(options._data, options._code)
    }
  },
  base
)

export default moduleOwn
