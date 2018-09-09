/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Directory } from './directory';
import { Event } from './event';

/**
 * Route entry interface.
 */
export interface Entry<T> {
  /**
   * Variable pattern.
   */
  pattern?: RegExp;
  /**
   * Variable name.
   */
  variable?: string;
  /**
   * List of exact events.
   */
  exact: Event[];
  /**
   * List of partial events.
   */
  partial: Event[];
  /**
   * Map of sub entries.
   */
  entries: Directory<T>;
}
