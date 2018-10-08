const replace = require('replace-in-file');
const { capFirstLetter, createNonExistantDirSync, copyFileSync } = require('./util');

const getMongooseDataType = (inputType) => {
  let type;
  if (inputType.toLowerCase() === 'string') {
    type = 'String';
  } else if (inputType.toLowerCase() === 'number') {
    type = 'Number';
  } else if (inputType.toLowerCase() === 'boolean') {
    type = 'Boolean';
  } else if (inputType.toLowerCase() === 'buffer') {
    type = 'Buffer';
  } else if (inputType.toLowerCase() === 'date') {
    type = 'Date';
  } else if (inputType.toLowerCase() === 'objectid') {
    type = 'ObjectId';
  } else if (inputType.toLowerCase() === 'array') {
    type = 'Array';
  } else {
    type = 'String';
  }
  return type;
};

const createModel = (resourceName, resource) => {
  createNonExistantDirSync('./generatedApp/src/models');
  const modelFilePath = `./generatedApp/src/models/${resourceName}.ts`;
  let variableStringBuilder = '';
  Object.keys(resource.properties).forEach((variable, index) => {
    const lineEnding = index === Object.keys(resource.properties).length - 1 ? ',' : ',\n  ';
    const dataType = getMongooseDataType(resource.properties[variable]);

    variableStringBuilder += `${variable}: ${dataType}${lineEnding}`;
  });
  try {
    const options = {
      files: modelFilePath,
      from: [/SCHEMA_NAME/g, /MODEL_NAME_CAP/g, /MODEL_VARIABLES/g],
      to: [`${resourceName}Schema`, capFirstLetter(resourceName), variableStringBuilder],
    };
    copyFileSync('./templates/model.txt', modelFilePath);
    replace.sync(options);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createModel;
