const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');
const replace = require('replace-in-file');
const { ncp } = require('ncp');

const capFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

const createModel = async (modelName, model) => {
  const modelFilePath = `./generatedApp/src/models/${modelName}.ts`;
  let variableStringBuilder = '';
  Object.keys(model.variables).forEach((variable, index) => {
    const lineEnding =
      index === Object.keys(model.variables).length - 1 ? ',' : ',\n  ';
    variableStringBuilder += `${variable}: ${
      model.variables[variable]
    }${lineEnding}`;
  });
  try {
    const options = {
      files: modelFilePath,
      from: [/SCHEMA_NAME/g, /MODEL_NAME_CAP/g, /MODEL_VARIABLES/g],
      to: [
        `${modelName}Schema`,
        capFirstLetter(modelName),
        variableStringBuilder,
      ],
    };
    await fs
      .createReadStream('./templates/model.txt')
      .pipe(fs.createWriteStream(modelFilePath, { flag: 'a' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

const createValidators = async (modelName, model) => {
  const validatorFolderPath = `./generatedApp/src/controllers/validators/${modelName}`;
  const validatorFilePath = `./generatedApp/src/controllers/validators/${modelName}/index.ts`;
  let bodyQueryParamsStringBuilder = '';
  Object.keys(model.variables).forEach((variable, index) => {
    const lineEnding =
      index === Object.keys(model.variables).length - 1 ? ',' : ',\n    ';
    bodyQueryParamsStringBuilder += `${variable}: Joi.${String(model.variables[variable]).toLocaleLowerCase()}()${lineEnding}`;
  });
  try {
    const options = {
      files: validatorFilePath,
      from: [/BODY_PARAMS/g, /QUERY_PARAMS/g, /MODEL_NAME_CAP/g],
      to: [
        bodyQueryParamsStringBuilder,
        bodyQueryParamsStringBuilder,
        capFirstLetter(modelName),
      ],
    };
    if (!fs.existsSync(validatorFolderPath)) {
      fs.mkdirSync(validatorFolderPath);
    }
    await fs
      .createReadStream('./templates/validator.txt')
      .pipe(fs.createWriteStream(validatorFilePath, { flag: 'w' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

const createController = async (modelName, model) => {
  const controllerFolderPath = './generatedApp/src/controllers';
  const controllerFilePath = `${controllerFolderPath}/${modelName}Controller.ts`;
  try {
    const options = {
      files: controllerFilePath,
      from: [/MODEL_NAME_CAP/g, /MODELNAME/g, /BODY_PARAMS/g],
      to: [
        capFirstLetter(modelName),
        modelName,
        Object.keys(model.variables).join(', '),
      ],
    };
    await fs
      .createReadStream('./templates/controller.txt')
      .pipe(fs.createWriteStream(controllerFilePath, { flag: 'w' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

const createRoutes = async (modelName) => {
  const httpMethods = ['getAll', 'get', 'post', 'put', 'delete'];
  let routeHandlers = `// ${capFirstLetter(modelName)} routes\n`;
  const controllerImports = `import ${modelName}Controller from "./${modelName}Controller";\n`;
  const validationImports = `import ${modelName}Validator from "./validators/${modelName}";\n`;
  httpMethods.forEach(async (method) => {
    const endpoint = method === 'getAll' || method === 'post' ? `/${modelName}` : `/${modelName}/:id`;
    const controllerFunctionName =
      method === 'getAll'
        ? `get${capFirstLetter(modelName)}s`
        : `${method}${capFirstLetter(modelName)}`;
    routeHandlers += `router.${
      method === 'getAll' ? 'get' : method
    }("${endpoint}", `;
    routeHandlers += `${modelName}Validator.${method}${capFirstLetter(modelName)}${method === 'getAll' ? 's' : ''}, `;
    routeHandlers += `${modelName}Controller.${controllerFunctionName});`;
    routeHandlers += '\n';
  });
  return { controllerImports, validationImports, routeHandlers };
};

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
  const modelImports = Object.keys(config.app.models).map(m => `import "../models/${m}";\n`).join('');
  const controllersIndexFilePath = './generatedApp/src/controllers/index.ts';

  await Promise.all(Object.keys(config.app.models).map(async (modelName) => {
    const model = config.app.models[modelName];
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
