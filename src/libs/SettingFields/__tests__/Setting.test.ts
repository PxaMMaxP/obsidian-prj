/**
 * @jest-environment jsdom
 */

import { Component } from 'obsidian';
import {
    registerMockLogger,
    resetMockLogger,
} from 'src/__mocks__/ILogger.mock';
import {
    MockComponent_,
    registerMockComponent,
    resetMockComponent,
} from 'src/libs/Modals/CustomModal/__mocks__/Component.mock';
import { ICustomModal } from 'src/libs/Modals/CustomModal/interfaces/ICustomModal';
import { InstantiationError } from '../interfaces/Exceptions';
import { SettingItem } from '../SettingItem';

registerMockLogger();
registerMockComponent();

describe('SettingItem', () => {
    let mockComponent: Component;
    let mockModal: ICustomModal | undefined;
    let containerEl: HTMLElement;

    beforeEach(() => {
        resetMockLogger();
        resetMockComponent();
        document.body.innerHTML = ''; // Reset the document body for each test
        mockComponent = new MockComponent_();
        containerEl = document.createElement('div');

        // mockModal = {
        //     content: containerEl,
        //     component: mockComponent,
        // } as unknown as ICustomModal;

        mockModal = mockComponent as unknown as ICustomModal;
        (mockModal.content as any) = containerEl;
    });

    it('should instantiate SettingItem correctly', () => {
        const settingItem = new SettingItem(
            undefined,
            undefined,
            containerEl,
            mockComponent,
        );
        expect(settingItem.parentContainerEl).toBe(containerEl);
        expect(settingItem.parentComponent).toBe(mockComponent);
        expect(settingItem.parentModal).toBeUndefined();
    });

    it.skip('should configure the SettingItem correctly', () => {
        const configure = jest.fn();
        const item = new SettingItem(mockModal, configure);
        item.load();
        expect(configure).toHaveBeenCalled();
    });

    it('should throw error if add method fails to instantiate setting field', () => {
        const settingItem = new SettingItem(mockModal);

        const invalidSettingField = jest.fn().mockImplementation(() => {
            throw new Error('Instantiation Error');
        });

        expect(() => {
            settingItem.add(invalidSettingField, jest.fn());
        }).toThrow(InstantiationError);
    });

    it('should set the name correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const name = 'Test Name';
        settingItem.setName(name);
        expect(settingItem.nameEl.innerText).toBe(name);
    });

    it('should append name element correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const nameFragment = document.createDocumentFragment();
        const nameSpan = document.createElement('span');
        nameSpan.textContent = 'Test Name Fragment';
        nameFragment.appendChild(nameSpan);
        settingItem.setName(nameFragment);
        expect(settingItem.nameEl.contains(nameSpan)).toBe(true);
    });

    it('should set the description correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const description = 'Test Description';
        settingItem.setDescription(description);
        expect(settingItem.descriptionEl.innerText).toBe(description);
    });

    it('should append description element correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const descriptionFragment = document.createDocumentFragment();
        const descriptionSpan = document.createElement('span');
        descriptionSpan.textContent = 'Test Description Fragment';
        descriptionFragment.appendChild(descriptionSpan);
        settingItem.setDescription(descriptionFragment);
        expect(settingItem.descriptionEl.contains(descriptionSpan)).toBe(true);
    });

    it('should set the display correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const display = 'Test Display';
        settingItem.setDisplay(display);
        expect(settingItem.displayEl.innerText).toBe(display);
    });

    it('should append display element correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const displayFragment = document.createDocumentFragment();
        const displaySpan = document.createElement('span');
        displaySpan.textContent = 'Test Display Fragment';
        displayFragment.appendChild(displaySpan);
        settingItem.setDisplay(displayFragment);
        expect(settingItem.displayEl.contains(displaySpan)).toBe(true);
    });

    it('should set the class correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const className = 'test-class';
        settingItem.setClass(className);

        expect(settingItem.settingFieldEl.classList.contains(className)).toBe(
            true,
        );
    });

    it('should set the class array correctly', () => {
        const settingItem = new SettingItem(mockModal);
        const className = ['test-class', 'test-class-2'];
        settingItem.setClass(className);

        expect(
            settingItem.settingFieldEl.classList.contains(className[0]),
        ).toBe(true);

        expect(
            settingItem.settingFieldEl.classList.contains(className[1]),
        ).toBe(true);
    });

    it('should log error if then callback fails', () => {
        const settingItem = new SettingItem(mockModal);

        const callback = jest.fn().mockImplementation(() => {
            throw new Error('Callback Error');
        });

        expect(() => {
            settingItem.then(callback);
        }).toThrow(InstantiationError);
    });

    it('should append elements correctly using LazzyLoading', () => {
        const settingItem = new SettingItem(mockModal);

        // Accessing lazily loaded elements to trigger their creation
        expect(settingItem.settingFieldEl).toBeDefined();
        expect(settingItem.infoEl).toBeDefined();
        expect(settingItem.nameEl).toBeDefined();
        expect(settingItem.descriptionEl).toBeDefined();
        expect(settingItem.displayEl).toBeDefined();
        expect(settingItem.inputEl).toBeDefined();

        // Verify that elements are appended correctly
        expect(containerEl.querySelector('.setting-item')).not.toBeNull();
        expect(containerEl.querySelector('.setting-item-info')).not.toBeNull();
        expect(containerEl.querySelector('.setting-item-name')).not.toBeNull();

        expect(
            containerEl.querySelector('.setting-item-description'),
        ).not.toBeNull();

        expect(
            containerEl.querySelector('.setting-item-display'),
        ).not.toBeNull();

        expect(
            containerEl.querySelector('.setting-item-control'),
        ).not.toBeNull();
    });

    it.skip('should throw error if configure method fails', () => {
        const settingItem = new SettingItem(mockModal);

        const validSettingField = jest.fn().mockImplementation(() => {});

        const configure = jest.fn().mockImplementation(() => {
            throw new Error('Configure Error');
        });

        settingItem.add(validSettingField, configure);

        expect(() => {
            settingItem.onload();
        }).toThrow(InstantiationError);
    });

    it.skip('should add setting field correctly', () => {
        const settingItem = new SettingItem(mockModal);

        class MockSettingField {
            settingItem: SettingItem;

            constructor(settingItem: SettingItem) {
                this.settingItem = settingItem;
            }

            build(): void {}
        }

        const configure = jest.fn((field) => field);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settingItem.add(MockSettingField as any, configure);
        settingItem.load();
        expect(configure).toHaveBeenCalled();
    });
});
