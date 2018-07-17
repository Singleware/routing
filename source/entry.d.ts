/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Observable from '@singleware/observable';

import { Environments } from './environments';
import { Directory } from './directory';
import { Match } from './match';

/**
 * Route entry interface.
 */
export interface Entry<T> {
  /**
   * Entry variable pattern.
   */
  pattern?: RegExp;
  /**
   * Entry variable name.
   */
  variable?: string;
  /**
   * Map of sub entires.
   */
  entries: Directory<T>;
  /**
   * Map of environment variables.
   */
  environments: Environments;
  /**
   * Match events.
   */
  onMatch: Observable.Subject<Match<T>>;
  /**
   * Exact match events.
   */
  onExactMatch: Observable.Subject<Match<T>>;
}
