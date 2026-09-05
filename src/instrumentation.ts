export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { flushTokenAnalyticsToR2 } = await import('@/utils/token-tracker');

    const handleShutdown = async (signal: string) => {
      console.log(`[Instrumentation] Received ${signal}. Flushing pending token analytics to R2...`);
      try {
        await flushTokenAnalyticsToR2();
      } catch (err: any) {
        console.warn('[Instrumentation] Error flushing analytics on shutdown:', err.message);
      }
      process.exit(0);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  }
}
