/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { App, TFile } from 'obsidian';
import MockLogger from 'src/__mocks__/ILogger.mock';
import { ILogger } from 'src/interfaces/ILogger';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { DIContainer } from '../../DependencyInjection/DIContainer';
import { HelperObsidian } from '../Obsidian';

jest.mock('src/libs/LifecycleManager/decorators/Lifecycle'); // Disable Lifecycle
jest.mock('src/classes/decorators/Singleton'); // Disable Singleton

jest.mock('obsidian', () => {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        App: jest.fn().mockImplementation(() => {
            return {
                workspace: {
                    getActiveFile: jest.fn(),
                    getLeaf: jest.fn().mockReturnValue({
                        openFile: jest.fn(),
                        getViewState: jest.fn().mockReturnValue({ state: {} }),
                        setViewState: jest.fn(),
                    }),
                    activeLeaf: {
                        rebuildView: jest.fn(),
                    },
                },
            };
        }),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        TFile: jest.fn().mockImplementation(() => {
            return {
                path: 'test-path',
            };
        }),
    };
});

describe('HelperObsidian', () => {
    let diContainerMock: IDIContainer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let appMock: any;
    let loggerMock: ILogger | undefined;

    const initializeMocks = (withLogger: boolean) => {
        diContainerMock = DIContainer.getInstance();
        appMock = new App();
        loggerMock = withLogger ? MockLogger : undefined;

        diContainerMock.resolve = jest.fn((key) => {
            if (key === 'App') {
                return appMock;
            }

            if (key === 'ILogger_' && withLogger) {
                return {
                    getLogger: jest.fn(() => loggerMock),
                };
            }
        });

        diContainerMock.register = jest.fn();
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe.each([true, false])('withLogger: %s', (withLogger) => {
        beforeEach(() => {
            initializeMocks(withLogger);
        });

        describe('getActiveFile', () => {
            it('should return the active file', () => {
                const activeFile = new TFile();
                appMock.workspace.getActiveFile.mockReturnValue(activeFile);

                const result = HelperObsidian.getActiveFile();
                expect(result).toBe(activeFile);
            });

            it('should log a warning if no active file is found', () => {
                appMock.workspace.getActiveFile.mockReturnValue(undefined);

                const result = HelperObsidian.getActiveFile();
                expect(result).toBeUndefined();

                if (withLogger) {
                    expect(loggerMock!.warn).toHaveBeenCalledWith(
                        'No active file found',
                    );
                }
            });
        });

        describe('openFile', () => {
            it('should open the specified file in the active leaf', async () => {
                const file = new TFile();
                const openFileMock = appMock.workspace.getLeaf().openFile;

                await HelperObsidian.openFile(file);
                expect(openFileMock).toHaveBeenCalledWith(file);

                if (withLogger) {
                    expect(loggerMock!.trace).toHaveBeenCalledWith(
                        `Opening file: ${file.path}`,
                    );
                }
            });

            it('should set the view state to preview mode', async () => {
                const file = new TFile();
                const leafMock = appMock.workspace.getLeaf();
                const setViewStateMock = leafMock.setViewState;

                await HelperObsidian.openFile(file);

                expect(setViewStateMock).toHaveBeenCalledWith({
                    state: { mode: 'preview' },
                });
            });
        });

        describe('rebuildActiveView', () => {
            it('should rebuild the active view', () => {
                const rebuildViewMock =
                    appMock.workspace.activeLeaf.rebuildView;

                HelperObsidian.rebuildActiveView();
                expect(rebuildViewMock).toHaveBeenCalled();
            });

            it('should log an error if rebuilding the view fails', () => {
                const rebuildViewMock =
                    appMock.workspace.activeLeaf.rebuildView;
                const error = new Error('test error');

                rebuildViewMock.mockImplementation(() => {
                    throw error;
                });

                HelperObsidian.rebuildActiveView();

                if (withLogger) {
                    expect(loggerMock!.error).toHaveBeenCalledWith(
                        'Error rebuilding active view',
                        error,
                    );
                }
            });
        });
    });
});
