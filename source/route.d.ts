/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Callable } from './types';
import { Constraint } from './constraint';
import { Variables } from './variables';

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
  onMatch: Callable;
}
