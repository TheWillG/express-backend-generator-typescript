const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');
const { exec } = require('child_process');
const replace = require('replace-in-file');
const { ncp } = require('ncp');
const createValidators = require('./lib/createValidators');
const createModel = require('./lib/createModel');
const createRoutes = require('./lib/createRoutes');
const createController = require('./lib/createController');

const templateFilePath = './generatorConfig.yml';

(async () => {
  if (!fs.existsSync(templateFilePath)) {
    console.error(`Error: Could not locate file ${templateFilePath}`);
    return;
  }
  const config = yaml.safeLoad(fs.readFileSync(templateFilePath, 'utf8'));
  const appTemplate = config.app.auth === 'basic' ? 'localAuthApp' : 'basicApp';
  const appFolderName = config.app.name.replace(/ /g, '');
  try {
    const ncpP = util.promisify(ncp);
    await ncpP(`./templates/${appTemplate}`, './generatedApp');
  } catch (e) {
    console.error('Error: Could not copy reference template.');
    return;
  }

  let combinedControllerImports = '';
  let combinedValidationImports = '';
  let combinedRouteHandlers = '';
  if (appTemplate === 'localAuthApp' && config.app.resources.user) {
    console.error('User resource cannot be included since it will be created by local auth');
    return;
  }
  const modelImports = Object.keys(config.app.resources).map(m => `import "../models/${m}";\n`).join('');
  const controllersIndexFilePath = './generatedApp/src/controllers/index.ts';

  await Promise.all(Object.keys(config.app.resources).map(async (resourceName) => {
    const resource = config.app.resources[resourceName];
    try {
      await createModel(resourceName, resource);
      await createValidators(resourceName, resource);
      await createController(resourceName, resource);
      const {
        controllerImports,
        validationImports,
        routeHandlers,
      } = await createRoutes(resourceName, resource);
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
    exec(`mv generatedApp ${appFolderName} && cd ./${appFolderName} && npm i`);
  } catch (e) {
    console.error(e);
  }
})();
