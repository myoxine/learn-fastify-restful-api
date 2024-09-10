import envSchema from 'env-schema' 
import { FromSchema } from "json-schema-to-ts";
const schema = {
  type: 'object',
  required: [ 'PORT' ],
  properties: {
    PORT: {
      type: 'string',
      default: 3000
    }
  }
} as const
type schemaType = FromSchema<typeof schema>;
const config = envSchema<schemaType>({
  schema: schema,
  dotenv: true // load .env if it is there, default: false

})
export default config;