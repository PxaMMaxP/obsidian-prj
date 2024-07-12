import { IDeconstructor } from 'src/interfaces/IDeconstructor';
import { ContextMenu } from '../ContextMenu';

/**
 * Represents an interface for the {@link ContextMenu|context menu} class.
 */
export interface IContextMenu extends IDeconstructor {
    /**
     * This method is called when the command menu is invoked.
     */
    invoke(): Promise<void>;
}
