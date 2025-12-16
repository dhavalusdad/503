import { init } from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';
import { AxiosError } from 'axios';
import { shouldReportToSentry } from '@/api/utils';

init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN_KEY,
  environment: import.meta.env.VITE_PUBLIC_SENTRY_ENVIRONMENT,
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    const error = hint.originalException;

    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        | { success: boolean; message: string }
        | undefined;

      if (!shouldReportToSentry(error, responseData)) {
        return null;
      }
    }

    return event;
  },
});
