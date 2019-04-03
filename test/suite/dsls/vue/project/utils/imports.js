/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import '../../../../bridge/imports'

import {
  commandsList,
  callActionJsonList,
  uniqueId,
  initApp,
  initPage,
  boot
} from '../../../../bridge/platform/index'

boot('vue')

export { uniqueId, initApp, initPage, commandsList, callActionJsonList }
