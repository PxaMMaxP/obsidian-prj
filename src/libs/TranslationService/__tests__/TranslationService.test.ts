/* eslint-disable @typescript-eslint/naming-convention */
import MockLogger from 'src/__mocks__/ILogger.mock';
import { DEFAULT_SETTINGS, PrjSettings } from 'src/types/PrjSettings';
import ILanguageTranslations from '../interfaces/ILanguageTranslations';
import { TranslationService } from '../TranslationService';

const mockTranslations: ILanguageTranslations[] = [
    {
        lang: 'en',
        translations: {
            'Copy MD Link': 'Copy Markdown Link',
            Acronym: 'Acronym',
            // ...
        },
    },
    {
        lang: 'de',
        translations: {
            'Copy MD Link': 'Markdown Link kopieren',
            Acronym: 'Akronym',
            // ...
        },
    },
];

const mockSettings: PrjSettings = { ...DEFAULT_SETTINGS, language: 'en' };

describe('TranslationService', () => {
    let translationService: TranslationService;

    beforeEach(() => {
        translationService = new TranslationService(
            mockTranslations,
            mockSettings,
            MockLogger,
        );
    });

    it('should return the correct translation for a given key', () => {
        expect(translationService.get('Copy MD Link')).toBe(
            'Copy Markdown Link',
        );
        expect(translationService.get('Acronym')).toBe('Acronym');
    });

    it('should return the key if the translation is not found', () => {
        expect(translationService.get('unknown')).toBe('unknown');
    });

    it('should log a warning if the translation is not found', () => {
        const spyWarn = jest.spyOn(MockLogger, 'warn');
        translationService.get('unknown');

        expect(spyWarn).toHaveBeenCalledWith(
            'Translation for key unknown not found',
        );
    });

    it('should return all translations for a given key', () => {
        const expectedTranslations = [
            'Copy Markdown Link',
            'Markdown Link kopieren',
        ];

        expect(translationService.getAll('Copy MD Link')).toEqual(
            expectedTranslations,
        );
    });

    it('should return the key in all languages if the translation is not found', () => {
        const expectedTranslations = ['unknown', 'unknown'];

        expect(translationService.getAll('unknown')).toEqual(
            expectedTranslations,
        );
    });

    it.skip('should log a warning for each missing translation', () => {
        const spyWarn = jest.spyOn(MockLogger, 'warn');
        translationService.getAll('unknown');
        expect(spyWarn).toHaveBeenCalledTimes(mockTranslations.length);
    });

    it('should throw an error if getInstance is called before initialization', () => {
        // Reset instance to undefined
        TranslationService.instance = undefined;

        expect(() => TranslationService.getInstance()).toThrow(
            'TranslationService not initialized',
        );
    });

    it('should return the instance if getInstance is called after initialization', () => {
        const instance = TranslationService.getInstance();
        expect(instance).toBeInstanceOf(TranslationService);
    });

    describe('without a logger', () => {
        beforeEach(() => {
            translationService = new TranslationService(
                mockTranslations,
                mockSettings,
            );
        });

        it('should return the correct translation for a given key', () => {
            expect(translationService.get('Copy MD Link')).toBe(
                'Copy Markdown Link',
            );
            expect(translationService.get('Acronym')).toBe('Acronym');
        });

        it('should return the key if the translation is not found', () => {
            expect(translationService.get('unknown')).toBe('unknown');
        });

        it('should not throw an error when logging a warning if the translation is not found', () => {
            expect(() => translationService.get('unknown')).not.toThrow();
        });

        it('should return all translations for a given key', () => {
            const expectedTranslations = [
                'Copy Markdown Link',
                'Markdown Link kopieren',
            ];

            expect(translationService.getAll('Copy MD Link')).toEqual(
                expectedTranslations,
            );
        });

        it('should return the key in all languages if the translation is not found', () => {
            const expectedTranslations = ['unknown', 'unknown'];

            expect(translationService.getAll('unknown')).toEqual(
                expectedTranslations,
            );
        });
    });
});
