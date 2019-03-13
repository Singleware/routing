/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Entry } from './entry';

/**
 * Directory of entries, interface.
 */
export interface Directory<T> {
  [directory: string]: Entry<T>;
}
