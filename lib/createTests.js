const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter } = require('./util');

const getMockData = (inputType) => {
  let mock;
  if (inputType.toLowerCase() === 'string') {
    mock = "'string1'";
  } else if (inputType.toLowerCase() === 'number') {
    mock = 100;
  } else if (inputType.toLowerCase() === 'boolean') {
    mock = true;
  } else if (inputType.toLowerCase() === 'buffer') {
    mock = "'binary1'";
  } else if (inputType.toLowerCase() === 'date') {
    mock = Date.now();
  } else if (inputType.toLowerCase() === 'objectid') {
    mock = "'objectId1'";
  } else if (inputType.toLowerCase() === 'array') {
    mock = ["'arrayData'"];
  } else {
    mock = "'mockData'";
  }
  return mock;
};

const createTests = async (resourceName, resource) => {
  const testMapper = [
    { action: 'get', name: 'fetch' },
    { action: 'put', name: 'update' },
    { action: 'post', name: 'create' },
    { action: 'delete', name: 'remove' },
  ];
  const files = `./generatedApp/__tests__/${resourceName}.spec.ts`;
  const renamingFrom = [/MODEL_NAME_CAP/g, /MODEL_NAME/g];
  const renamingTo = [capFirstLetter(resourceName), resourceName.toLowerCase()];
  const actionsFrom = [];
  const actionsTo = [];
  let bodyQueryParamsStringBuilder = '';
  const modelVariables = Object.keys(resource.properties);
  modelVariables.forEach((variable, index) => {
    const mockData = getMockData(resource.properties[variable]);
    const lineEnding = index === modelVariables.length - 1 ? ',' : ',\n    ';
    bodyQueryParamsStringBuilder += `${variable}: ${mockData}${lineEnding}`;
  });
  const bodyParamsFrom = [/BODY_PARAMS/g];
  const bodyParamsTo = [bodyQueryParamsStringBuilder];
  const resourceActions = resource.actions.map(action => action.toLowerCase());
  testMapper.forEach((mapper) => {
    actionsFrom.unshift(new RegExp(`${mapper.action.toUpperCase()}_TESTS`, 'g'));
    if (resourceActions.includes(mapper.action)) {
      actionsTo.unshift(fs.readFileSync(`./templates/${mapper.name}Test.txt`).toString());
    } else {
      actionsTo.unshift('');
    }
  });
  try {
    const actionsOptions = { files, from: actionsFrom, to: actionsTo };
    const renamingOptions = { files, from: renamingFrom, to: renamingTo };
    const bodyParamsOptions = { files, from: bodyParamsFrom, to: bodyParamsTo };
    await fs
      .createReadStream('./templates/test.txt')
      .pipe(fs.createWriteStream(files, { flag: 'w' }));
    await replace(actionsOptions);
    await replace(renamingOptions);
    await replace(bodyParamsOptions);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createTests;
