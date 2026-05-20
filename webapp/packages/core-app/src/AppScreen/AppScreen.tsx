/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { memo } from 'react';

import { Loader } from '@cloudbeaver/core-blocks';
import { Main } from './Main.js';

export const AppScreen = memo(function AppScreen() {
  return (
    <Loader suspense>
      <Loader suspense>
        <Main />
      </Loader>
    </Loader>
  );
});
