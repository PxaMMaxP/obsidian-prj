import { Component } from 'obsidian';
import { IInternalSettingItem } from './SettingItem';

// export type SettingFieldConfigurator<
//     T extends new (...args: unknown[]) => unknown,
// > = (instance: InstanceType<T>) => void;

export type SettingFieldConfigurator<T> = (instance: T) => void;

export interface ISettingField_<
    Type extends new (
        parent: IInternalSettingItem,
        configure?: ConstructorParameters<Type>[1],
    ) => ISettingField,
> {
    /**
     * @param settingField The setting item that the setting field belongs to.
     * @param configurator A function that configures the setting field.
     */
    new (
        parent: IInternalSettingItem,
        configure?: ConstructorParameters<Type>[1],
    ): ISettingField;
}

export interface ISettingField extends Component {
    /**
     * Apply the {@link SettingFieldConfigurator} to the setting item.
     */
    onload(): void;
}
