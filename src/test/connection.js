/* eslint-env mocha */
const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://127.0.0.1:27017/TESTING', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  mongoose.connection
    .once('open', () => {
      console.log('DB TEST has been connected');
      done();
    })
    .on('error', (err) => {
      console.log('DB Connection error: ', err);
    });
});

after((done) => {
  mongoose.connection.collections.landmarks.drop(() => {
    console.log('\n************-Collection was dropped-************');
    done();
  });
});
