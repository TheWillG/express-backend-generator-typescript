# Express Generator Backend Typescript
This generator is powered by TypeScript, Express, Mongoose/MongoDB, log4js, and Joi.

## Overview
This generator is a CRUD app generator with server-side validation on all requests based on the model definitions.  It is driven by an input yaml file (generatorConfig.yml) that is read by the generator. The main schema of the input config file is:
```yaml
# generatorConfig.yml
app:
  name: APP_NAME
  models:
    MODEL_NAME_1:
      variables:
        MODEL_FIELD_1: PRIMITIVE_TYPE
        MODEL_FIELD_2: PRIMITIVE_TYPE
        MODEL_FIELD_3: PRIMITIVE_TYPE
```
