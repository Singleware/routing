/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Entry } from './entry';

/**
 * Entry directory map interface.
 */
export interface Directory<T> {
  [directory: string]: Entry<T>;
}
