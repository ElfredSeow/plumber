import { randomUUID } from 'crypto'

import { ITriggerItem } from '@plumber/types'
import { DateTime } from 'luxon'

/**
 * Shared by the editor test run and the "Run now" mutation.
 *
 * IMPORTANT: users pick variables from the test run output, so a real run
 * must produce the same keys or those variables resolve to blank.
 */
export default function buildManualTriggerItem(
  triggeredBy: string,
): ITriggerItem {
  const dateTime = DateTime.now()

  return {
    raw: {
      triggeredBy,
      date: dateTime.toPlumberFormat('dd MMM yyyy'),
      time: dateTime.toLocaleString(DateTime.TIME_WITH_SECONDS),
      triggeredAt: dateTime.toISO(),
    },
    meta: {
      internalId: randomUUID(),
    },
  }
}
