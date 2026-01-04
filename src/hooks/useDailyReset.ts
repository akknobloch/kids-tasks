import { useEffect } from 'react';
import { resetTasksIfNeeded } from '../storage';

export function useDailyReset() {
  useEffect(() => {
    (async () => {
      await resetTasksIfNeeded();
    })();
  }, []);
}
