// eslint-disable-next-line prefer-const
export let Dependencies: Array<unknown> = [];

import {
    TagsDefaultDependencies,
    TagDefaultDependencies,
} from 'src/libs/Tags/Tags.dependency';
Dependencies.push(TagsDefaultDependencies);
Dependencies.push(TagDefaultDependencies);
