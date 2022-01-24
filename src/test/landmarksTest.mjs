/* eslint-env mocha */
import assert from 'assert';
import {
  getLandmarkById,
  getLandmarkByChannel,
  getLandmarkAll,
  getLandmarkBeforeDate,
  getLandmarkAfterDate,
  postLandmarkUpdateOne,
  postDis,
} from '../libs/landmarksDataProcessing.js';
import {
  filterLandmarksInBody,
  filterChannelsInRequest,
  checkIsRequestDate,
  isBodyValid,
} from '../libs/requestProcessing.js';
import Landmark from '../models/Landmark.js';
import DisMessage from '../models/DisMessage.js';

let lm, lmAdditional;

describe('Test cases for landmarks API', function () {
  describe('Test api: GET', () => {
    before((done) => {
      lm = new Landmark({
        value: '1_value',
        timestamp: '2021-09-10T12:35:31Z',
        channel: 'CH1',
        type: 'waypoint',
        id: 'TTdYRnHc',
        fingerprint: '1_finger',
      });

      lmAdditional = new Landmark({
        value: '2_value',
        timestamp: '2021-10-11T12:35:31Z',
        channel: 'CH2',
        type: 'waypoint',
        id: '2_TTdYRnHc',
        fingerprint: '2_finger',
      });

      lm.save()
        .then(function () {
          assert(lm.isNew === false);
        })
        .then(
          lmAdditional
            .save()
            .then(function () {
              assert(lmAdditional.isNew === false);
              done();
            })
            .catch(done)
        );
    });

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const reqGet = {
      method: 'GET',
      body: {
        landmarks: [
          {
            id: 'id',
            value: '1_value',
            beforeDate: tomorrowDate.toISOString(),
          },
        ],
      },
      headers: {
        'content-type': 'application/json',
      },
    };

    it('Given empty body, should return "false" and the appropriate message', () => {
      const body = {};
      const result = isBodyValid(body);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.message, 'Empty body');
    });

    it('Given body with corrupted "landmarks"-entry, should return "true" and the appropriate message', () => {
      const body = { landmarks_corrupted: [] };
      const result = isBodyValid(body);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(
        result.message,
        'Empty landmarks: at least one landmark expected'
      );
    });

    it('Given body with corrupted individual "landmark"-entry, should return "true" and the appropriate message', () => {
      const body = { landmarks: [{ id_corrupted: 'OneTwo' }] };
      const result = isBodyValid(body);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(
        result.message,
        'Individual landmark(s) entry(es) not valid'
      );
    });

    it('Given landmark id, should return the landmark with the given id', async () => {
      const id = 'TTdYRnHc';
      const result = await getLandmarkById(id);
      assert.strictEqual(result[0].id, 'TTdYRnHc');
    });

    it('Given unexisting ID in the DB, should return an empty object', async () => {
      const id = 'unexistedId';
      const result = await getLandmarkById(id);
      assert.strictEqual(result.length, 0);
    });

    it('Given the dates in different formatting, should always return true', () => {
      const reqDate1 = '2021-03-03';
      const reqDate2 = '01-01-2020';
      const reqDate3 = '01/01/2020';
      const reqDate4 = '01.01.2020';
      const reqDate5 = '2020/01/01';
      const reqDate6 = '2020.01.01';
      const wrongDate = '2020.01.0';

      assert.strictEqual(checkIsRequestDate(reqDate1), true);
      assert.strictEqual(checkIsRequestDate(reqDate2), true);
      assert.strictEqual(checkIsRequestDate(reqDate3), true);
      assert.strictEqual(checkIsRequestDate(reqDate4), true);
      assert.strictEqual(checkIsRequestDate(reqDate5), true);
      assert.strictEqual(checkIsRequestDate(reqDate6), true);
      assert.strictEqual(checkIsRequestDate(wrongDate), false);
    });

    it('Given the date, should return all landmarks, which were created before (or equal) provided date', async () => {
      const beforeDate = reqGet.body.landmarks[0].beforeDate;
      const result = await getLandmarkBeforeDate(beforeDate);
      assert.strictEqual(result.length, 2);
    });

    it('Given the date, should return all landmarks, which were created after (or equal) provided date', async () => {
      const afterDate1 = '2021-10-01';
      const result1 = await getLandmarkAfterDate(afterDate1);
      assert.strictEqual(result1.length, 1);
      const afterDate2 = '2021-09-01';
      const result2 = await getLandmarkAfterDate(afterDate2);
      assert.strictEqual(result2.length, 2);
    });

    it('Given the period in seconds, should return all landmarks, which were created in provided period from current time', async () => {
      const now = new Date();
      const prior = new Date('2021-09-20');
      const seconds = Math.floor((now - prior) / 1000);
      const startPeriod = new Date(
        (Math.floor(Date.now() / 1000) - seconds) * 1000
      );
      const result = await getLandmarkAfterDate(startPeriod);
      assert.strictEqual(result.length, 1);
    });

    it('Given the date, that is before the smallest one in the DB, should return empty object', async () => {
      const outOfRangeTimestamp = '1900-01-01';
      const result = await getLandmarkBeforeDate(outOfRangeTimestamp);
      assert.strictEqual(result.length, 0);
    });

    it('Given nothing provided, should return all existing landmarks', () => {
      const thirdChannel = new Landmark({
        value: 'value',
        timestamp: '2020.01.01',
        fingerprint: 'Test_finger_3',
        channel: 'channel',
        id: 'uniqueID',
        type: 'type',
      });

      thirdChannel.save().then(async () => {
        const result = await getLandmarkAll();
        assert.strictEqual(result.length, 3);
      });
    });

    it('Given array of landmarks, should return array with only landmarks, consisting names', () => {
      const reqBody = {
        landmarks: [
          {
            id: 'landmark1',
            value: 'lm',
          },
          {
            id: 'landmark2',
            value: 'lm',
          },
          {
            id: 'landmark3',
            value: 'lm',
          },
          {
            type: 'lm',
          },
        ],
      };

      const result = filterLandmarksInBody(reqBody);
      assert.strictEqual(result.length, 3);
    });

    it(`Given request with comma-separated channels' names, should return the array with channels' names`, () => {
      const request = 'CH1,CH2,CH3';
      const result = filterChannelsInRequest(request);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[1], 'CH2');
    });

    it(`Given channel(s)' names, comma-separated, should return array with only landmarks inside a given channel(s)`, async () => {
      const result1 = await getLandmarkByChannel('CH1');
      assert.strictEqual(result1.length, 1);
    });
  });

  describe('Test api: POST', () => {
    let lm;

    before((done) => {
      lm = new Landmark({
        id: 'TEST_POST',
        channel: 'CH1',
        fingerprint: 'Test_finger_1',
      });

      lm.save()
        .then(function () {
          assert(lm.isNew === false);
        })
        .then(done());
    });

    it('Given request with the array of landmarks, should return array with the landmarks with name only', () => {
      const requestArrOfChannels = {
        landmarks: [
          {
            id: 'value',
          },
          {
            id1: 'value1',
            somevalue: 'test',
          },
          {
            id: 'value',
            name: 'channelName',
          },
          {
            channelId: 'value',
            id: 'someName',
          },
        ],
      };

      const result = filterLandmarksInBody(requestArrOfChannels);

      assert.strictEqual(result.length, 3);
    });

    it("Given one new channel to POST, should return object with 'ok: 1' - field", async () => {
      const newLmToPost = {
        value: 'completelyNewValue',
        fingerprint: 'completelyNewFingerprint',
        channel: 'completelyNewChannel',
      };
      let result = await postLandmarkUpdateOne(newLmToPost);

      assert.strictEqual(result, 1);
    });

    it("Given one channel to POST with the name, that already exists in the DB, should return object with 'ok: 1' - field", async () => {
      const existedChToPost = {
        value: 'TEST_POST',
        fingerprint: 'Test_finger_1',
        channel: 'Channel_1',
      };
      let resultPostExisted = await postLandmarkUpdateOne(existedChToPost);

      assert.strictEqual(resultPostExisted, 1);
    });
  });
});

describe('Test cases for DIS', function () {
  describe('Test DIS: POST', () => {
    let disMsg;

    before((done) => {
      disMsg = new DisMessage({
        entityID: {
          site: 11,
          application: 22,
          entity: 33,
        },
        marking: 'DIS_marking_before',
        location: {
          x: 1,
          y: 1,
          z: 1,
        },
      });

      disMsg
        .save()
        .then(function () {
          assert(disMsg.isNew === false);
        })
        .then(done());
    });

    it("Given a message from client to POST via server, should return object with 'ok: 1' - field", async () => {
      const newDisMsgToPost = {
        entityID: {
          site: 44,
          application: 55,
          entity: 66,
        },
        marking: 'DIS_marking_test',
        location: {
          x: 2,
          y: 2,
          z: 2,
        },
      };
      let result = await postDis(newDisMsgToPost);

      assert.strictEqual(result, 1);
    });
  });
});
