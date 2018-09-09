/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Variables } from './variables';
import { Entry } from './entry';

/**
 * Selection interface.
 */
export interface Selection<T> {
  /**
   * Selection path.
   */
  directories: string[];
  /**
   * Selected entries.
   */
  entries: Entry<T>[];
  /**
   * Selected variables.
   */
  variables: Variables;
}
