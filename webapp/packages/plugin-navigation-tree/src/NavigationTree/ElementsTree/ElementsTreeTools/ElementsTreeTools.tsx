/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { observer } from 'mobx-react-lite';
import type React from 'react';

import { Fill, IconButtonStyles, type PlaceholderElement, s, SContext, type StyleRegistry, useS } from '@cloudbeaver/core-blocks';
import { useCaptureViewContext } from '@cloudbeaver/core-view';

import { DATA_CONTEXT_ELEMENTS_TREE } from '../DATA_CONTEXT_ELEMENTS_TREE.js';
import type { IElementsTree } from '../useElementsTree.js';
import { ElementsTreeFilter } from './ElementsTreeFilter.js';
import ElementsTreeToolsStyles from './ElementsTreeTools.module.css';
import ElementsTreeToolsIconButtonStyles from './ElementsTreeToolsIconButton.module.css';
import { ElementsTreeToolsMenu } from './ElementsTreeToolsMenu.js';
import { DATA_CONTEXT_NAV_TREE_ROOT } from './NavigationTreeSettings/DATA_CONTEXT_NAV_TREE_ROOT.js';
import type { IElementsTreeSettingsProps } from './NavigationTreeSettings/ElementsTreeSettingsService.js';

const registry: StyleRegistry = [
  [
    IconButtonStyles,
    {
      mode: 'append',
      styles: [ElementsTreeToolsIconButtonStyles],
    },
  ],
];

interface Props {
  tree: IElementsTree;
  settingsElements?: PlaceholderElement<IElementsTreeSettingsProps>[];
}

export const ElementsTreeTools = observer<React.PropsWithChildren<Props>>(function ElementsTreeTools({ tree, children }) {
  const baseRoot = tree.baseRoot;
  const styles = useS(ElementsTreeToolsStyles, ElementsTreeToolsIconButtonStyles);

  useCaptureViewContext((context, id) => {
    context.set(DATA_CONTEXT_NAV_TREE_ROOT, baseRoot, id);
    context.set(DATA_CONTEXT_ELEMENTS_TREE, tree, id);
  });

  return (
    <SContext registry={registry}>
      <div className={s(styles, { tools: true })}>
        <div className={s(styles, { actions: true })}>
          <Fill />
          <ElementsTreeToolsMenu tree={tree} />
        </div>
        <ElementsTreeFilter tree={tree} />
        {children}
      </div>
    </SContext>
  );
});
