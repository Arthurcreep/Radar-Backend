export function getDecisionStyle(decision) {
  if (decision === 'top opportunity') {
    return 'border-green-200 bg-green-50 text-green-800';
  }

  if (decision === 'investigate') {
    return 'border-blue-200 bg-blue-50 text-blue-800';
  }

  if (decision === 'caution') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }

  if (decision === 'restricted') {
    return 'border-red-200 bg-red-50 text-red-800';
  }

  if (decision === 'no data') {
    return 'border-slate-200 bg-slate-50 text-slate-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export function getSourceStyle(status) {
  if (status === 'ok') {
    return 'border-green-200 bg-green-50 text-green-800';
  }

  if (status === 'empty') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }

  if (status === 'failed') {
    return 'border-red-200 bg-red-50 text-red-800';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}