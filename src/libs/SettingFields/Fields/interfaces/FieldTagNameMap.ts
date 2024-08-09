import { IButtonFluentAPI } from './IButton';
import { IDisplayFieldFluentAPI } from './IDisplayField';
import { IDropdownFluentAPI } from './IDropdown';
import { IInputFluentAPI } from './IInput';
import { ITagSearchFluentAPI } from './ITagSearch';
import { IToggleFluentAPI } from './IToggle';

export interface ISettingFieldTagNameMap {
    button: IButtonFluentAPI;
    input: IInputFluentAPI;
    dropdown: IDropdownFluentAPI;
    tagsearch: ITagSearchFluentAPI;
    display: IDisplayFieldFluentAPI<unknown, unknown>;
    toggle: IToggleFluentAPI;
}
