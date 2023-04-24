import { Logger } from '@nestjs/common';
import WaitSignal from 'wait-signal';

export class ConfigManager {
  private log: Logger = new Logger(ConfigManager.name);
  private _loading = false;
  private _loadSignal: WaitSignal<boolean> = new WaitSignal();
  private _envs: Record<string, string> = {};

  constructor() {}

  public load(): Promise<boolean> {
    if (this._loading) {
      return this._loadSignal.wait();
    }
    this._loading = true;
    this.log.log('Start config manager loading...');
    require('dotenv').config({
      path: `${__dirname}\\..\\.env.development.local`,
    });
    return Promise.resolve()
      .then(() => {
        this.log.log('config loading done');
        this._loadSignal.signal(true);
        return true;
      })
      .catch((err) => {
        this.log.log(`config loading failed: ${err}`);
        this._loadSignal.throw(err);
        return Promise.reject(err);
      });
  }

  public get(key: string): string | undefined {
    return this._envs[key] || process.env[key];
  }
  public get SENTRY_DSN(): string | undefined {
    return this.get('SENTRY_DSN');
  }
}

const instance = new ConfigManager();
export default instance;
