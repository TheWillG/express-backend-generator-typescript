const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter, copyFileSync } = require('./util');

const getJoiDataType = (inputType) => {
  let type;
  if (inputType.toLowerCase() === 'string') {
    type = 'string';
  } else if (inputType.toLowerCase() === 'number') {
    type = 'number';
  } else if (inputType.toLowerCase() === 'boolean') {
    type = 'boolean';
  } else if (inputType.toLowerCase() === 'buffer') {
    type = 'binary';
  } else if (inputType.toLowerCase() === 'date') {
    type = 'date';
  } else if (inputType.toLowerCase() === 'objectid') {
    type = 'string';
  } else if (inputType.toLowerCase() === 'array') {
    type = 'array';
  } else {
    type = 'String';
  }
  return type;
};

const createValidators = (resourceName, resource) => {
  const actions = ['get', 'put', 'post', 'delete'];
  const validatorsDir = './generatedApp/src/validators';
  if (!fs.existsSync(validatorsDir)) {
    fs.mkdirSync(validatorsDir);
  }
  const validatorsFrom = [];
  const validatorsTo = [];
  const exportsFrom = /VALIDATOR_EXPORTS/g;
  let exportsTo = '';
  const validatorFolderPath = `./generatedApp/src/validators/${resourceName}`;
  const files = `./generatedApp/src/validators/${resourceName}/index.ts`;
  let bodyQueryParamsStringBuilder = '';
  const modelVariables = Object.keys(resource.properties);
  modelVariables.forEach((variable, index) => {
    const joiDataType = getJoiDataType(resource.properties[variable]);
    const lineEnding = index === modelVariables.length - 1 ? ',' : ',\n    ';
    bodyQueryParamsStringBuilder += `${variable}: Joi.${joiDataType}()${lineEnding}`;
  });
  const resourceActions = resource.actions.map(action => action.toLowerCase());
  actions.forEach((action) => {
    validatorsFrom.unshift(new RegExp(`${action.toUpperCase()}_VALIDATOR`, 'g'));
    if (resourceActions.includes(action)) {
      validatorsTo.unshift(fs.readFileSync(`./templates/${action}Validator.txt`).toString());
      exportsTo += `  ${action}${capFirstLetter(resourceName)},\n`;
      if (action === 'get') exportsTo += `  ${action}All${capFirstLetter(resourceName)}s,\n`;
    } else {
      validatorsTo.unshift('');
    }
  });
  try {
    const validatorsOptions = { files, from: validatorsFrom, to: validatorsTo };
    const renamingOptions = {
      files,
      from: [/BODY_PARAMS/g, /QUERY_PARAMS/g, /MODEL_NAME_CAP/g],
      to: [bodyQueryParamsStringBuilder, bodyQueryParamsStringBuilder, capFirstLetter(resourceName)],
    };
    const exportsOptions = { files, from: exportsFrom, to: exportsTo };
    if (!fs.existsSync(validatorFolderPath)) {
      fs.mkdirSync(validatorFolderPath);
    }
    copyFileSync(`./templates/validator.txt`, files);
    replace.sync(validatorsOptions);
    replace.sync(renamingOptions);
    replace.sync(exportsOptions);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createValidators;
