export declare class Cache extends Map {
    private timeout;
    constructor(timeout?: number);
    set(key: any, value: any): this;
    get<T = unknown>(key: string): T | null;
    getOrSet<T = unknown>(key: string, fn: () => any): T | null;
    delete(key: any): boolean;
    clear(): void;
}
