import { IButtonFluentAPI } from './IButton';
import { IDisplayFluentApi } from './IDisplayField';
import { IDropdownFluentApi } from './IDropdown';
import { IInputFluentApi } from './IInput';
import { ITagSearchFluentAPI } from './ITagSearch';
import { IToggleFluentApi } from './IToggle';

export interface ISettingColumnTagNameMap {
    button: IButtonFluentAPI;
    input: IInputFluentApi;
    dropdown: IDropdownFluentApi;
    tagsearch: ITagSearchFluentAPI;
    display: IDisplayFluentApi<unknown, unknown>;
    toggle: IToggleFluentApi;
}
