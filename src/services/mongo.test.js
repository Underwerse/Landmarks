import { describe } from 'riteway';
import { getLandmarks } from './mongo';

describe('mongodb', async (assert) => {
  {
    const landmarks = await getLandmarks();
    assert({
      given: 'no arguments',
      should: 'make an http request',
      expected: [],
      actual: landmarks,
    });
  }
});
