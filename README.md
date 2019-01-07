# Express Generator Backend Typescript
Generate entire TypeScript CRUD API with one simple YAML file.
This generator is powered by TypeScript, Express, Mongoose/MongoDB, log4js, and Joi.

## Overview
This generator is a CRUD app generator with server-side validation on all requests based on the model definitions.  It is driven by an input yaml file (generatorConfig.yml) that is read by the generator. 

## Getting Started
1. Create a `generatorConfig.yml` file in the project root directory following the provided outline.
2. Run `npm run start` to run the app generator
3. Change into the directory of the generated app
4. Copy `.env-example` to `.env` and populate
5. Start your app using `npm run start`!

## Template File Outline
The main schema of the input config file is:
```yaml
# generatorConfig.yml <- Generator will look for this file

app:
  name: APP_NAME
  resources:
    MODEL_NAME_SINGULAR_1:
      properties:
        MODEL_FIELD_1: PRIMITIVE_TYPE
        MODEL_FIELD_2: PRIMITIVE_TYPE
      actions:
        - CONTROLLER_ACTION_1
        - CONTROLLER_ACTION_2
        - CONTROLLER_ACTION_3
    MODEL_NAME_SINGULAR_2:
      properties:
        MODEL_FIELD_1: PRIMITIVE_TYPE
        MODEL_FIELD_2: PRIMITIVE_TYPE
      actions:
        - CONTROLLER_ACTION_1
```

Example:
```yaml
# generatorConfig.yml
app:
  name: SuperCalendar
  resources:
    employee:
      properties:
        id: String
        name: String
        location: String
      actions:
        - GET
        - POST
```
