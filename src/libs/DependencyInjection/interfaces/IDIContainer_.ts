import { IDIContainer } from './IDIContainer';

/**
 * Static Dependency Injection Container Interface
 */
export interface IDIContainer_ {
    /**
     * Get the singleton instance of the DIContainer
     */
    getInstance(): IDIContainer;
}
