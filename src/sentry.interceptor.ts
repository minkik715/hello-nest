import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Raven from 'raven';
import { catchError, Observable, of } from 'rxjs';
import * as Sentry from '@sentry/node';
import { Certificate } from 'crypto';
import * as https from 'https';
import * as tls from 'tls';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        Sentry.captureException(error);
        Sentry.init({
          dsn: '',
        });
        return of(error);
      }),
    );
  }
}
const zeronCaCert = Buffer.from('zeron-ca-der-string-here', 'base64');

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  timeout: 5000,
  rejectUnauthorized: true,
  ca: [zeronCaCert],
  checkServerIdentity: (hostname, cert) => {
    const err = tls.checkServerIdentity(hostname, cert);
    if (err) {
      err.message = `Custom error message: ${err.message}`;
    }
    return err;
  },
  secureContext: tls.createSecureContext({
    ca: [zeronCaCert],
  }),
});
Raven.config('', {
  httpsAgent: agent,
}).install();

@