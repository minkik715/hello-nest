import { Module } from '@nestjs/common';
import { AnimationController } from './animation/animation.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry.interceptor';
import { SentryModule } from './sentry/sentry.module';
import * as Sentry from '@sentry/node';

@Module({
  imports: [SentryModule],
  controllers: [AnimationController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        Sentry.getCurrentHub().getClient() ? new SentryInterceptor() : null,
    },
  ],
})
export class AppModule {}
