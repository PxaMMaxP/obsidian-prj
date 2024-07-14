import { LifecycleManager } from '../LifecycleManager';

describe('LifecycleManager', () => {
    let lifecycleManager: LifecycleManager;
    let callbackMock: jest.Mock<Promise<void>, []>;

    const resetLifecycleManager = () => {
        lifecycleManager['_isInitPerformed'] = false;
        lifecycleManager['_isLoadPerformed'] = false;
        lifecycleManager['_isUnloadPerformed'] = false;
    };

    beforeEach(() => {
        lifecycleManager = new LifecycleManager();
        callbackMock = jest.fn().mockResolvedValue(undefined);
    });

    test('should register callback if lifecycle state is not performed', async () => {
        await lifecycleManager['registerOn']('before', 'init', callbackMock);

        expect(lifecycleManager['_callbacks'].init?.before).toContain(
            callbackMock,
        );
    });

    test('should immediately execute callback if init state is already performed', async () => {
        lifecycleManager['initPerfomed']();

        await lifecycleManager['registerOn']('before', 'init', callbackMock);

        expect(callbackMock).toHaveBeenCalled();
    });

    test('should immediately execute callback if load state is already performed', async () => {
        lifecycleManager['loadPerformed']();

        await lifecycleManager['registerOn']('before', 'load', callbackMock);

        expect(callbackMock).toHaveBeenCalled();
    });

    test('should immediately execute callback if unload state is already performed', async () => {
        lifecycleManager['unloadPerformed']();

        await lifecycleManager['registerOn']('before', 'unload', callbackMock);

        expect(callbackMock).toHaveBeenCalled();
    });

    test('should register multiple callbacks for the same state and time', async () => {
        resetLifecycleManager();

        const anotherCallbackMock = jest.fn().mockResolvedValue(undefined);

        await lifecycleManager['registerOn']('before', 'init', callbackMock);

        await lifecycleManager['registerOn'](
            'before',
            'init',
            anotherCallbackMock,
        );

        expect(lifecycleManager['_callbacks'].init?.before).toContain(
            callbackMock,
        );

        expect(lifecycleManager['_callbacks'].init?.before).toContain(
            anotherCallbackMock,
        );
    });

    test('should execute registered callbacks when onInit is called', async () => {
        await lifecycleManager['registerOn']('before', 'init', callbackMock);

        await lifecycleManager.onInit();

        expect(callbackMock).toHaveBeenCalled();
    });

    test('should execute registered callbacks when onLoad is called', async () => {
        await lifecycleManager['registerOn']('before', 'load', callbackMock);

        await lifecycleManager.onLoad();

        expect(callbackMock).toHaveBeenCalled();
    });

    test('should execute registered callbacks when onUnload is called', async () => {
        await lifecycleManager['registerOn']('before', 'unload', callbackMock);

        await lifecycleManager.onUnload();

        expect(callbackMock).toHaveBeenCalled();
    });
});
