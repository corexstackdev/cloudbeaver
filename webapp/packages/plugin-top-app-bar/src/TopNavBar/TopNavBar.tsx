/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import type { PlaceholderContainer } from '@cloudbeaver/core-blocks';

interface Props {
  container: PlaceholderContainer<Record<string, any>>;
  className?: string;
}

export const TopNavBar: React.FC<Props> = function TopNavBar() {
  return null;
};
