module.exports = {
  default: {
    paths: ['specs/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['specs/features/step-definitions/**/*.ts'],
    format: ['progress', 'html:cucumber-report.html'],
    publishQuiet: true,
  },
};
