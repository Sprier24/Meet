'use client';

import { useCallback, useState, useTransition } from 'react';

export function useActionState<T>(action: (...args: any[]) => Promise<T>, initialState: T | null = null) {
  const [state, setState] = useState<T | null>(initialState);
  const [isPending, startTransition] = useTransition();

  const formAction = useCallback(
    async (formData: FormData) => {
      startTransition(async () => {
        const result = await action(formData);
        setState(result);
      });
    },
    [action]
  );

  return [state, formAction, isPending] as const;
}
