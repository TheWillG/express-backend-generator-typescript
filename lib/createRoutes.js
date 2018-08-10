const { capFirstLetter } = require('./util');

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

module.exports = createRoutes;