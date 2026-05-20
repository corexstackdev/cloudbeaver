/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { Bootstrap, injectable } from '@cloudbeaver/core-di';

@injectable()
export class SettingsAdministrationPluginBootstrap extends Bootstrap {
  override register(): void | Promise<void> {
    // Settings administration is intentionally hidden from the left sidebar.
  }
}
