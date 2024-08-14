/**
 * @jest-environment jsdom
 */

import { Component } from 'obsidian';
import {
    registerMockLogger,
    resetMockLogger,
} from 'src/__mocks__/ILogger.mock';
import { Flow } from 'src/libs/HTMLFlow/Flow';
import {
    MockComponent_,
    registerMockComponent,
} from 'src/libs/Modals/CustomModal/__mocks__/Component.mock';
import { TSinjex } from 'ts-injex';
import { GetSuggestionsCallback } from '../../components/interfaces/IGenericSuggest';
import { ISettingRowProtected } from '../../interfaces/ISettingRow';
import { Input } from '../Input';

registerMockLogger();
registerMockComponent();
TSinjex.getInstance().register('IGenericSuggest_', {});
TSinjex.getInstance().register('IApp', {});
TSinjex.getInstance().register('IFlow_', Flow);

const SettingItemMock: ISettingRowProtected & Component =
    new MockComponent_() as unknown as ISettingRowProtected & Component;

(SettingItemMock['inputEl'] as HTMLDivElement) = document.createElement('div');

describe('Input', () => {
    beforeEach(() => {
        resetMockLogger();
        //resetMockComponent();
        document.body.innerHTML = ''; // Reset the document body for each test
    });

    it('should initialize with the given setting item', () => {
        const input = new Input(SettingItemMock);
        input.load();
        expect(input).toBeInstanceOf(Input);
    });

    it('should set and get value correctly', () => {
        const input = new Input(SettingItemMock);
        input.setValue('test value');
        input.load();
        expect(input.getValue()).toBe('test value');
    });

    it('should set and get placeholder correctly', () => {
        const input = new Input(SettingItemMock);
        input.setPlaceholder('test placeholder');
        input.load();
        expect(input.elements.inputEl.placeholder).toBe('test placeholder');
    });

    it('should set input element type correctly', () => {
        const input = new Input(SettingItemMock);
        input.setInputElType('HTMLTextAreaElement');
        input.load();
        expect(input.elements.inputEl.tagName.toLowerCase()).toBe('textarea');
    });

    it('should set input type correctly', () => {
        const input = new Input(SettingItemMock);
        input.setInputElType('HTMLInputElement').setType('password');
        input.load();

        if (input.elements.inputEl instanceof HTMLInputElement) {
            expect(input.elements.inputEl.type).toBe('password');
        } else {
            throw new Error(
                'Input element is not an instance of HTMLInputElement',
            );
        }
    });

    it('should call onChange callback on value change', () => {
        const input = new Input(SettingItemMock);
        const mockCallback = jest.fn();
        input.onChange(mockCallback);
        input.load();
        input.elements.inputEl.value = 'new value';
        input.elements.inputEl.dispatchEvent(new Event('change'));
        expect(mockCallback).toHaveBeenCalledWith('new value');
    });

    it('should warn at add suggestions correctly', () => {
        const input = new Input(SettingItemMock);

        input.addSuggestion(
            undefined as unknown as GetSuggestionsCallback<string>,
        );
        input.load();
    });
});
