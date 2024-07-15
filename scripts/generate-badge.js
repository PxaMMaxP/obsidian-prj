const { createBadges } = require('istanbul-badges-readme');

createBadges({
    istanbulReport: '../coverage/coverage-summary.json',
    badgesDirectory: '../docs/badges',
    coverageType: 'statements', // 'statements', 'branches', 'lines', or 'functions'
});
