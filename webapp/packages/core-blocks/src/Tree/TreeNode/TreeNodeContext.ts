/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { type Context, createContext } from 'react';

export interface ITreeNodeContext {
  disabled: boolean;
  readonly processing: boolean;
  expanded: boolean;
  externalExpanded: boolean;
  showInFilter: boolean;
  loading: boolean;
  selected: boolean;
  indeterminateSelected: boolean;
  leaf: boolean;
  group: boolean;
  readonly select: (multiple?: boolean, nested?: boolean) => Promise<void>;
  readonly click?: () => Promise<void>;
  readonly expand: () => Promise<void>;
  readonly open: () => Promise<void>;
  readonly processAction: (action: () => Promise<void>) => Promise<void>;
}

export const TreeNodeContext: Context<ITreeNodeContext> = createContext<ITreeNodeContext>(undefined as unknown as ITreeNodeContext); // TODO: provide a real default value
