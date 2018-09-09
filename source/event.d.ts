/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Callable } from './types';
import { Variables } from './variables';

/**
 * Route event interface.
 */
export interface Event {
  /**
   * Environment variables.
   */
  environment?: Variables;
  /**
   * Event callback.
   */
  callback: Callable;
}
