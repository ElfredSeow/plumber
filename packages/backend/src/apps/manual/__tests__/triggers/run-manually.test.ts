import '@/types/luxon-extensions'
import type { IExecutionStep, IGlobalVariable, IUser } from '@plumber/types'
import { describe, expect, it, vi } from 'vitest'

import buildManualTriggerItem from '../../common/build-trigger-item'
import runManually from '../../triggers/run-manually'

function makeGlobalVariable({
  user,
  loggedInUser,
}: { user?: Partial<IUser>; loggedInUser?: Partial<IUser> } = {}) {
  return {
    pushTriggerItem: vi.fn(),
    user,
    loggedInUser,
  } as unknown as IGlobalVariable
}

function pushedItem($: IGlobalVariable) {
  return ($.pushTriggerItem as ReturnType<typeof vi.fn>).mock.calls[0][0]
}

describe('manual trigger: runManually', () => {
  it('declares itself as a non-polling, non-webhook-URL trigger', () => {
    expect(runManually.key).toBe('runManually')
    expect(runManually.type).toBe('webhook')
    // No getInterval means the flow worker will not create a repeatable
    // cron job for this trigger when the pipe is published.
    expect(runManually.getInterval).toBeUndefined()
  })

  it('testRun() pushes the start time and the tester email', async () => {
    const $ = makeGlobalVariable({
      user: { email: 'owner@example.gov.sg' },
      loggedInUser: { email: 'editor@example.gov.sg' },
    })

    await runManually.testRun?.($)

    expect($.pushTriggerItem).toHaveBeenCalledTimes(1)
    expect(pushedItem($).raw).toEqual({
      triggeredAt: expect.any(String),
      date: expect.any(String),
      time: expect.any(String),
      triggeredBy: 'editor@example.gov.sg',
    })
    expect(pushedItem($).meta.internalId).toEqual(expect.any(String))
  })

  it('falls back to the pipe owner email when no one is logged in', async () => {
    const $ = makeGlobalVariable({ user: { email: 'owner@example.gov.sg' } })

    await runManually.run?.($)

    expect(pushedItem($).raw.triggeredBy).toBe('owner@example.gov.sg')
  })

  it('generates a distinct internalId on each invocation', async () => {
    const $1 = makeGlobalVariable()
    const $2 = makeGlobalVariable()

    await runManually.testRun?.($1)
    await runManually.testRun?.($2)

    expect(pushedItem($1).meta.internalId).not.toEqual(
      pushedItem($2).meta.internalId,
    )
  })

  it('test runs and "Run now" produce the same variables', async () => {
    const $ = makeGlobalVariable({
      loggedInUser: { email: 'a@example.gov.sg' },
    })

    await runManually.testRun?.($)

    const realRunItem = buildManualTriggerItem('a@example.gov.sg')
    expect(Object.keys(realRunItem.raw).sort()).toEqual(
      Object.keys(pushedItem($).raw).sort(),
    )
  })

  it('labels every variable in plain words', async () => {
    const { raw } = buildManualTriggerItem('a@example.gov.sg')

    const metadata = await runManually.getDataOutMetadata?.({
      dataOut: raw,
    } as unknown as IExecutionStep)

    expect(metadata).toEqual({
      triggeredAt: { label: 'Standard date and time' },
      date: { label: 'Date' },
      time: { label: 'Time' },
      triggeredBy: { label: 'Started by' },
    })
  })
})
