import buildManualTriggerItem from '@/apps/manual/common/build-trigger-item'
import { BadUserInputError } from '@/errors/graphql-errors'
import { DEFAULT_JOB_OPTIONS } from '@/helpers/default-job-configuration'
import { enqueueActionJob } from '@/queues/action'
import { processTrigger } from '@/services/trigger'

import type { MutationResolvers } from '../__generated__/types.generated'

/**
 * Fires a real (non-test) run of a published flow whose trigger is the
 * `manual` app, on demand. This reuses the same processTrigger /
 * enqueueActionJob path that the webhook controller uses for a real
 * (non-test) trigger event.
 */
const triggerFlowManually: MutationResolvers['triggerFlowManually'] = async (
  _parent,
  params,
  context,
) => {
  const flow = await context.currentUser
    .withAccessibleFlows({ requiredRole: 'editor' })
    .findOne({
      'flows.id': params.input.flowId,
    })
    .throwIfNotFound()

  if (!flow.active) {
    throw new BadUserInputError(
      'This pipe must be published before it can be triggered manually.',
    )
  }

  const triggerStep = await flow.getTriggerStep()

  if (triggerStep?.appKey !== 'manual') {
    throw new BadUserInputError(
      "This pipe's trigger step is not a manual trigger.",
    )
  }

  const triggerItem = buildManualTriggerItem(context.currentUser.email)

  const { executionId, shouldExecute } = await processTrigger({
    flowId: flow.id,
    stepId: triggerStep.id,
    triggerItem,
    testRun: false,
  })

  if (!shouldExecute) {
    return executionId
  }

  const nextStep = await triggerStep.getNextStep()

  if (nextStep) {
    const jobName = `${executionId}-${nextStep.id}`

    await enqueueActionJob({
      appKey: nextStep.appKey,
      actionKey: nextStep.key,
      jobName,
      jobData: {
        flowId: flow.id,
        executionId,
        stepId: nextStep.id,
      },
      jobOptions: DEFAULT_JOB_OPTIONS,
    })
  }

  return executionId
}

export default triggerFlowManually
