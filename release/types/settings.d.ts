/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Router settings interface.
 */
export interface Settings {
  /**
   * Path separator.
   */
  separator: string;
  /**
   * Path variable pattern.
   */
  variable: RegExp;
}
