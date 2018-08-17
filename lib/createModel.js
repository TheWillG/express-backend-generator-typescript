const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter } = require('./util');

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

const createModel = async (modelName, model) => {
  const modelsDir = './generatedApp/src/models';
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir);
  }
  const modelFilePath = `./generatedApp/src/models/${modelName}.ts`;
  let variableStringBuilder = '';
  Object.keys(model).forEach((variable, index) => {
    const lineEnding = index === Object.keys(model).length - 1 ? ',' : ',\n  ';
    const dataType = getMongooseDataType(model[variable]);

    variableStringBuilder += `${variable}: ${dataType}${lineEnding}`;
  });
  try {
    const options = {
      files: modelFilePath,
      from: [/SCHEMA_NAME/g, /MODEL_NAME_CAP/g, /MODEL_VARIABLES/g],
      to: [`${modelName}Schema`, capFirstLetter(modelName), variableStringBuilder],
    };
    await fs
      .createReadStream('./templates/model.txt')
      .pipe(fs.createWriteStream(modelFilePath, { flag: 'a' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createModel;
