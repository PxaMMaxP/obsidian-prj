import { Component } from 'obsidian';
import { IInternalSettingItem } from './ISetting';

export type SettingFieldConfigurator<
    T extends new (...args: unknown[]) => unknown,
> = (instance: InstanceType<T>) => void;

export interface ISettingField_<
    Type extends new (...args: unknown[]) => unknown,
> {
    /**
     * @param settingField The setting item that the setting field belongs to.
     * @param configurator A function that configures the setting field.
     */
    new (
        parent: IInternalSettingItem,
        configure?: SettingFieldConfigurator<Type>,
    ): ISettingField;
}

export interface ISettingField extends Component {
    /**
     * Apply the {@link SettingFieldConfigurator} to the setting item.
     */
    onload(): void;
}
