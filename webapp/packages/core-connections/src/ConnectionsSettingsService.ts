/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { injectable } from '@cloudbeaver/core-di';
import { SettingsProvider, SettingsProviderService } from '@cloudbeaver/core-settings';
import { schema, schemaExtra } from '@cloudbeaver/core-utils';

const settingsSchema = schema.object({
  'core.connections.disabled': schemaExtra.stringedBoolean().default(false),
});

export type ConnectionsSettings = schema.infer<typeof settingsSchema>;

@injectable(() => [SettingsProviderService])
export class ConnectionsSettingsService {
  get disabled(): boolean {
    return this.settings.getValue('core.connections.disabled');
  }
  readonly settings: SettingsProvider<typeof settingsSchema>;

  constructor(private readonly settingsProviderService: SettingsProviderService) {
    this.settings = this.settingsProviderService.createSettings(settingsSchema);
  }
}
