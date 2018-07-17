/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Observable from '@singleware/observable';

import { Constraint } from './constraint';
import { Variables } from './variables';
import { Match } from './match';

/**
 * Route interface.
 */
export interface Route<T> {
  /**
   * Route path.
   */
  path: string;
  /**
   * Determines whether the route match must be exact or not.
   */
  exact?: boolean;
  /**
   * Route environment variables.
   */
  environment?: Variables;
  /**
   * Route constraint.
   */
  constraint?: Constraint;
  /**
   * Match event.
   */
  onMatch: Observable.Observer<Match<T>>;
}
