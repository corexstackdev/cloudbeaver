/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { ConfirmationDialog } from '@cloudbeaver/core-blocks';
import { Bootstrap, injectable } from '@cloudbeaver/core-di';
import { CommonDialogService, DialogueStateResult } from '@cloudbeaver/core-dialogs';
import { ExecutorInterrupter } from '@cloudbeaver/core-executor';
import { UserSettingsService } from '@cloudbeaver/core-settings-user';
import { UserProfileOptionsPanelService } from '@cloudbeaver/plugin-user-profile';

@injectable(() => [UserProfileOptionsPanelService, UserSettingsService, CommonDialogService])
export class UserProfileSettingsPluginBootstrap extends Bootstrap {
  constructor(
    private readonly userProfileOptionsPanelService: UserProfileOptionsPanelService,
    private readonly userSettingsService: UserSettingsService,
    private readonly commonDialogService: CommonDialogService,
  ) {
    super();
  }

  override register(): void {
    this.userProfileOptionsPanelService.onClose.addHandler(async (data, context) => {
      if (!this.userSettingsService.isEdited()) {
        return;
      }

      const { status } = await this.commonDialogService.open(ConfirmationDialog, {
        title: 'ui_save_reminder',
        message: 'ui_are_you_sure',
      });

      if (status === DialogueStateResult.Rejected) {
        ExecutorInterrupter.interrupt(context);
        return;
      }

      this.userSettingsService.resetChanges();
    });

    // User profile settings are intentionally hidden.
  }
}
