import { Settings } from './settings';
import { Route } from './route';
import { Match } from './match';
/**
 * Generic router class.
 */
export declare class Router<T> {
    /**
     * Router entries.
     */
    private entries;
    /**
     * Entries counter.
     */
    private counter;
    /**
     * Router settings.
     */
    private settings;
    /**
     * Splits the specified path into an array of directories.
     * @param path Path to be splitted.
     * @returns Returns the array of directories.
     */
    private splitPath;
    /**
     * Creates a new empty entry.
     * @param pattern Variable pattern.
     * @param variable Variable name.
     * @returns Returns a new entry instance.
     */
    private createEntry;
    /**
     * Insert all required entries for the specified array of directories.
     * @param directories Array of directories.
     * @param constraint Path constraint.
     * @returns Returns the last inserted entry.
     */
    private insertEntries;
    /**
     * Search all entries that corresponds to the expected directory.
     * @param expected Expected directory.
     * @param entries Entries to select.
     * @returns Returns the selection results.
     */
    private searchEntries;
    /**
     * Collect all entries that corresponds to the specified array of directories.
     * The array of directories will be reduced according to the number of entries found.
     * @param directories Array of directories.
     * @returns Returns the selection results.
     */
    private collectEntries;
    /**
     * Default constructor.
     * @param settings Router settings.
     */
    constructor(settings: Settings);
    /**
     * Number of routes.
     */
    readonly length: number;
    /**
     * Adds the specified routes into the router.
     * @param routes List of routes.
     * @returns Returns the own instance.
     */
    add(...routes: Route<T>[]): Router<T>;
    /**
     * Match all routes that corresponds to the specified path.
     * @param path Route path.
     * @param detail Extra details data for notifications.
     * @returns Returns the manager for the matched routes.
     */
    match(path: string, detail: T): Match<T>;
    /**
     * Clear the router.
     * @returns Returns the own instance.
     */
    clear(): Router<T>;
}
