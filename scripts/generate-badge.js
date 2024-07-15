const { createBadges } = require('istanbul-badges-readme');

createBadges({
    istanbulReport: '../coverage/coverage-summary.json',
    badgesDirectory: '../docs/badges', // Verzeichnis für die Badges
    coverageType: 'statements', // Optional, kann 'statements', 'branches', 'lines', oder 'functions' sein
});
