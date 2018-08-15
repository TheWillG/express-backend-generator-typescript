const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');
const replace = require('replace-in-file');
const { ncp } = require('ncp');
const createValidators = require('./lib/createValidators'); 
const createModel = require('./lib/createModel'); 
const createRoutes = require('./lib/createRoutes'); 
const createController = require('./lib/createController'); 

(async () => {
  const config = yaml.safeLoad(fs.readFileSync('./generatorConfig.yml', 'utf8'));
  try {
    const ncpP = util.promisify(ncp);
    await ncpP('./templates/app', './generatedApp');
  } catch (e) {
    console.error(e);
  }

  let combinedControllerImports = '';
  let combinedValidationImports = '';
  let combinedRouteHandlers = '';
  const modelImports = Object.keys(config.app.resources).map(m => `import "../models/${m}";\n`).join('');
  const controllersIndexFilePath = './generatedApp/src/controllers/index.ts';

  await Promise.all(Object.keys(config.app.resources).map(async (modelName) => {
    const model = config.app.resources[modelName];
    try {
      await createModel(modelName, model);
      await createValidators(modelName, model);
      await createController(modelName, model);
      const {
        controllerImports,
        validationImports,
        routeHandlers,
      } = await createRoutes(modelName);
      combinedControllerImports += controllerImports;
      combinedValidationImports += validationImports;
      combinedRouteHandlers += `${routeHandlers}\n`;
    } catch (e) {
      console.error(e);
    }
  }));

  try {
    const options = {
      files: controllersIndexFilePath,
      from: [
        /ROUTE_HANDLERS;/g,
        /CONTROLLER_IMPORTS;/g,
        /VALIDATION_IMPORTS;/g,
        /MODEL_IMPORTS;/g,
      ],
      to: [
        combinedRouteHandlers,
        combinedControllerImports,
        combinedValidationImports,
        modelImports,
      ],
    };
    await replace(options);
  } catch (e) {
    console.error(e);
  }
})();
