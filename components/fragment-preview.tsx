'use client'

import { DaVinciInterpreter } from './fragment-interpreter'
import { DaVinciWeb } from './fragment-web'
import { ExecutionResult } from '@/lib/types'

export function DaVinciPreview({ result }: { result: ExecutionResult }) {
  if (result.template === 'code-interpreter-v1') {
    return <DaVinciInterpreter result={result} />
  }

  return <DaVinciWeb result={result} />
}
