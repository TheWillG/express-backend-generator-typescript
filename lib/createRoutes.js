const { capFirstLetter } = require('./util');

const createRoutes = async (resourceName, resource) => {
  const httpMethods = ['getAll', 'get', 'post', 'put', 'delete'];
  let routeHandlers = `// ${capFirstLetter(resourceName)} routes\n`;
  const controllerImports = `import ${resourceName}Controller from "./${resourceName}Controller";\n`;
  const validationImports = `import ${resourceName}Validator from "./validators/${resourceName}";\n`;
  httpMethods.forEach(async (method) => {
    if (resource.actions.includes(method.toUpperCase()) ||
    (method === 'getAll' && resource.actions.includes('GET'))) {
      const endpoint = method === 'getAll' || method === 'post' ? `/${resourceName}` : `/${resourceName}/:id`;
      const controllerFunctionName =
        method === 'getAll'
          ? `get${capFirstLetter(resourceName)}s`
          : `${method}${capFirstLetter(resourceName)}`;
      routeHandlers += `router.${
        method === 'getAll' ? 'get' : method
      }("${endpoint}", `;
      routeHandlers += `${resourceName}Validator.${method}${capFirstLetter(resourceName)}${method === 'getAll' ? 's' : ''}, `;
      routeHandlers += `${resourceName}Controller.${controllerFunctionName});`;
      routeHandlers += '\n';
    }
  });
  return { controllerImports, validationImports, routeHandlers };
};

module.exports = createRoutes;
