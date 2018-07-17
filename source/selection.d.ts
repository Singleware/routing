/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Entry } from './entry';
import { Variables } from './variables';

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
