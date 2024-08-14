/**
 * @jest-environment jsdom
 */

import { TFile } from 'obsidian';
import MockLogger, { MockLogger_ } from 'src/__mocks__/ILogger.mock';
import { TSinjex } from 'ts-injex';
import AddAnnotationModal from '../AddAnnotationModal';

const mockIApp = {
    vault: {
        append: jest.fn(),
    },
};

const mockIMetadataCache = {
    getEntry: jest.fn(),
};

const mockIHelperGeneral = {
    generateUID: jest.fn().mockReturnValue('12345'),
};

const mockIHelperObsidian = {
    getActiveFile: jest.fn(),
    showNotice: jest.fn(),
};

const mockICustomModal = jest.fn().mockImplementation(() => ({
    setBackgroundDimmed: jest.fn().mockReturnThis(),
    setDraggableEnabled: jest.fn().mockReturnThis(),
    setShouldOpen: jest.fn().mockReturnThis(),
    setOnOpen: jest.fn().mockReturnThis(),
    open: jest.fn(),
    close: jest.fn(),
    setTitle: jest.fn(),
    content: {
        addClass: jest.fn().mockReturnThis(),
        querySelector: jest.fn().mockReturnThis(),
    },
}));

const mockTranslationService = {
    get: jest.fn().mockImplementation((key) => key),
};

const mockSettingInstance = {
    setName: jest.fn().mockReturnThis(),
    setDesc: jest.fn().mockReturnThis(),
    setClass: jest.fn().mockReturnThis(),
    addTextArea: jest.fn().mockImplementation((callback) => {
        const textAreaMock = {
            setPlaceholder: jest.fn().mockReturnThis(),
            setValue: jest.fn().mockReturnThis(),
            onChange: jest.fn().mockImplementation((cb) => {
                cb('');

                return textAreaMock;
            }),
        };
        callback(textAreaMock);

        return mockSettingInstance;
    }),
    addText: jest.fn().mockImplementation((callback) => {
        const textMock = {
            setPlaceholder: jest.fn().mockReturnThis(),
            setValue: jest.fn().mockReturnThis(),
            onChange: jest.fn().mockImplementation((cb) => {
                cb('');

                return textMock;
            }),
        };
        callback(textMock);

        return mockSettingInstance;
    }),
    addButton: jest.fn().mockImplementation((callback) => {
        const buttonMock = {
            setButtonText: jest.fn().mockReturnThis(),
            setCta: jest.fn().mockReturnThis(),
            onClick: jest.fn().mockReturnThis(),
        };
        callback(buttonMock);

        return mockSettingInstance;
    }),
};

const mockSetting = jest.fn().mockImplementation(() => mockSettingInstance);

// Registering the mocks
TSinjex.register('ILogger_', MockLogger_);
TSinjex.register('IApp', mockIApp);
TSinjex.register('IMetadataCache', mockIMetadataCache);
TSinjex.register('IHelperGeneral_', mockIHelperGeneral);
TSinjex.register('IHelperObsidian', mockIHelperObsidian);
TSinjex.register('ICustomModal_', mockICustomModal);
TSinjex.register('ITranslationService', mockTranslationService);
TSinjex.register('Obsidian.Setting_', mockSetting);

describe('AddAnnotationModal', () => {
    let addAnnotationModal: AddAnnotationModal;

    beforeEach(() => {
        mockICustomModal.mockClear();
        mockSetting.mockClear();
        MockLogger_.reset();
        addAnnotationModal = new AddAnnotationModal();
        document.body.innerHTML = ''; // Reset the document body for each test
    });

    test('should instantiate correctly and call set methods on custom modal', () => {
        expect(mockICustomModal).toHaveBeenCalledTimes(1);

        expect(
            mockICustomModal.mock.results[0].value.setBackgroundDimmed,
        ).toHaveBeenCalledWith(false);

        expect(
            mockICustomModal.mock.results[0].value.setDraggableEnabled,
        ).toHaveBeenCalledWith(true);

        expect(
            mockICustomModal.mock.results[0].value.setShouldOpen,
        ).toHaveBeenCalled();

        expect(
            mockICustomModal.mock.results[0].value.setOnOpen,
        ).toHaveBeenCalled();
        expect(mockICustomModal.mock.results[0].value.open).toHaveBeenCalled();
    });

    test('should show notice and not open modal if no active file', () => {
        mockIHelperObsidian.getActiveFile.mockReturnValueOnce(null);
        const result = addAnnotationModal['shouldOpen']();
        expect(result).toBe(false);

        expect(mockIHelperObsidian.showNotice).toHaveBeenCalledWith(
            'No active file found',
            2500,
        );
    });

    test('should show notice and not open modal if active file is not metadata file', () => {
        const mockFile = {} as TFile;
        mockIHelperObsidian.getActiveFile.mockReturnValueOnce(mockFile);

        mockIMetadataCache.getEntry.mockReturnValueOnce({
            metadata: { frontmatter: { type: 'Note' } },
        });
        const result = addAnnotationModal['shouldOpen']();
        expect(result).toBe(false);

        expect(mockIHelperObsidian.showNotice).toHaveBeenCalledWith(
            'The active file is not a metadata file',
            2500,
        );
    });

    test('should set active file if it is a metadata file and open the modal', () => {
        const mockFile = {} as TFile;
        mockIHelperObsidian.getActiveFile.mockReturnValueOnce(mockFile);

        mockIMetadataCache.getEntry.mockReturnValueOnce({
            metadata: { frontmatter: { type: 'Metadata' } },
        });
        const result = addAnnotationModal['shouldOpen']();
        expect(result).toBe(true);
        expect(addAnnotationModal['_activeFile']).toBe(mockFile);
    });

    test('should append the generated annotation template to the active file on save', () => {
        const mockFile = {} as TFile;
        addAnnotationModal['_activeFile'] = mockFile;
        addAnnotationModal['save']();

        expect(mockIApp.vault.append).toHaveBeenCalledWith(
            mockFile,
            expect.any(String),
        );
    });

    test('should generate correct annotation template', () => {
        const template =
            addAnnotationModal['generateAnnotationTemplate']('12345');
        expect(template).toContain('>Link: [[#^12345|Zeige Zitat]]');
        expect(template).toContain('^12345');
    });

    test('should set modal content and title correctly on open', () => {
        addAnnotationModal['onOpen']();

        expect(
            mockICustomModal.mock.results[0].value.setTitle,
        ).toHaveBeenCalledWith('Add annotation');

        expect(
            mockICustomModal.mock.results[0].value.content.addClass,
        ).toHaveBeenCalledWith('custom-form');
    });

    test('should log and trace registration of command successfully', () => {
        const mockPlugin = {
            addCommand: jest.fn(),
        };
        TSinjex.register('IPrj', mockPlugin);
        AddAnnotationModal.registerCommand();

        expect(MockLogger.trace).toHaveBeenCalledWith(
            "Registered 'Add Annotation Modal' command successfully",
        );
    });

    test('should log and error registration of command if an error occurs', () => {
        const mockPlugin = {
            addCommand: jest.fn().mockImplementation(() => {
                throw new Error('Test Error');
            }),
        };
        TSinjex.register('IPrj', mockPlugin);
        AddAnnotationModal.registerCommand();

        expect(MockLogger.error).toHaveBeenCalledWith(
            "Failed to register 'Add Annotation Modal' command",
            expect.any(Error),
        );
    });

    test('should call the callback of the command', () => {
        const mockPlugin = {
            addCommand: jest
                .fn()
                .mockImplementation(({ callback }) => callback()),
        };
        TSinjex.register('IPrj', mockPlugin);

        AddAnnotationModal.registerCommand();

        expect(mockPlugin.addCommand).toHaveBeenCalled();
    });
});
