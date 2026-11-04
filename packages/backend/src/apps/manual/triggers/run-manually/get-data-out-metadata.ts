import { IDataOutMetadata, IExecutionStep } from '@plumber/types'

const LABELS: Record<string, string> = {
  triggeredAt: 'Standard date and time',
  date: 'Date',
  time: 'Time',
  triggeredBy: 'Started by',
}

async function getDataOutMetadata(
  executionStep: IExecutionStep,
): Promise<IDataOutMetadata> {
  const { dataOut: data } = executionStep
  if (!data) {
    return null
  }

  const metadata: IDataOutMetadata = {}
  for (const key of Object.keys(data)) {
    metadata[key] = {
      label: LABELS[key] ?? key,
    }
  }
  return metadata
}

export default getDataOutMetadata
