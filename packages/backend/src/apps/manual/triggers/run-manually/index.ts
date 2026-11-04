import { IGlobalVariable, IRawTrigger } from '@plumber/types'

import buildManualTriggerItem from '../../common/build-trigger-item'
import getDataOutMetadata from './get-data-out-metadata'

async function pushManualTriggerItem($: IGlobalVariable) {
  // The flow owner stands in when no one is logged in, e.g. a background run.
  const triggeredBy = ($.loggedInUser ?? $.user)?.email ?? ''
  await $.pushTriggerItem(buildManualTriggerItem(triggeredBy))
}

const trigger: IRawTrigger = {
  name: 'Run manually',
  key: 'runManually',
  type: 'webhook',
  description: 'Triggers only when a user runs this pipe on demand',
  getDataOutMetadata,

  async run($: IGlobalVariable) {
    await pushManualTriggerItem($)
  },

  async testRun($: IGlobalVariable) {
    await pushManualTriggerItem($)
  },
}

export default trigger
