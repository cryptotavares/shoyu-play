import supertest from 'supertest';
import { createServer } from '../../../src/http-server';

export let request: supertest.SuperTest<supertest.Test>;

export let initialized = false;

export async function init() {
  const app = await createServer();
  request = supertest(app);
  initialized = true;
}
