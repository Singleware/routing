/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Variables } from './variables';

/**
 * Entry environments interface.
 */
export interface Environments {
  /**
   * Default match variables.
   */
  default: Variables;
  /**
   * Exact match variables.
   */
  exact: Variables;
}
