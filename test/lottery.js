/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

// eslint-disable-next-line no-unused-vars
const should = chai.should();
// const { expect } = chai;
chai.use(chaiHttp);
let newId = '';

describe('***LOTTERY***', () => {
  describe('------RESULTS------', () => {
    /*
     * Test the /GET/results route
     */
    describe('/GET Get all lottery results', () => {
      it('it should GET all results from the db', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/results')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('newTicketRequired');
            res.body.results.should.be.a('array');
            res.body.count.should.be.a('number');
            done();
          });
      });
    });

    /*
     * Test the /GET/checkresults route
     */
    describe('/CHECK all lottery results', () => {
      it('it should CHECK all results for the open tickets', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/checkresults')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.results[0].should.have.property('timeForNewTicket');
            res.body.results.should.be.a('array');
            res.body.count.should.be.a('number');
            done();
          });
      });
    });
  });

  describe('------NUMBERS PLAYED------', () => {
    /*
     * Test the /GET/numbersplayed route
     */
    describe('/GET Get all lottery numbersplayed', () => {
      it('it should GET all numbersplayed from the db', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/numbersplayed')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.results.should.be.a('array');
            res.body.count.should.be.a('number');
            done();
          });
      });
    });

    /*
     * Test the /POST/numbersplayed route
     */
    describe('/POST Post a new set of numbers to playednumbers with an invalid game (lowercase m)', () => {
      const body = {
        game: 'm',
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        ball: 6,
        startDate: '01-29-2021',
        endDate: '1-29-2021'
      };
      it('it should NOT POST a new set of numbers to playednumbers', (done) => {
        chai
          .request(app)
          .post('/api/v1/lottery/numbersplayed')
          .send(body)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(500);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.message.message.should.equal(
              'PlayedNumber validation failed: game: `m` is not a valid enum value for path `game`.'
            );
            done();
          });
      });
    });

    /*
     * Test the /POST/numbersplayed route
     */
    describe('/POST Post a new set of numbers to playednumbers with valid data', () => {
      const body = {
        game: 'M',
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        ball: 6,
        startDate: '01-29-2021',
        endDate: '1-29-2021'
      };
      it('it should POST a new set of numbers to playednumbers', (done) => {
        chai
          .request(app)
          .post('/api/v1/lottery/numbersplayed')
          .send(body)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            newId = res.body.results._id;
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.results.should.have.property('allResultsChecked');
            done();
          });
      });
    });

    /*
     * Test the /GET/numbersplayed/:id route
     */
    describe('/GET Get a specific set of playednumbers', () => {
      it('it should Get a specific set of playednumbers', (done) => {
        chai
          .request(app)
          .get(`/api/v1/lottery/numbersplayed/${newId}`)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.playedNumbers.should.be.a('object');
            done();
          });
      });
    });

    /*
     * Test the /GET/numbersplayed/:id route
     */
    describe('/GET Get a specific set of playednumbers with INVALID ID', () => {
      it('it NOT should Get a specific set of playednumbers with an INVALID ID', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/numbersplayed/6014a6af531b3910f8b2c58')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have
              .property('error')
              .eql('Invalid Id for Played Numbers');
            done();
          });
      });
    });

    /*
     * Test the /PATCH/numbersplayed/:id route
     */
    describe('/PATCH Get a specific set of playednumbers', () => {
      const body = {
        game: 'P',
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        ball: 6,
        startDate: '01-30-2021',
        endDate: '1-30-2021'
      };
      it('it should Update a specific set of playednumbers', (done) => {
        chai
          .request(app)
          .patch(`/api/v1/lottery/numbersplayed/${newId}`)
          .send(body)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.results.should.have.property('game').eql('P');
            res.body.results.should.have
              .property('startDate')
              .eql('2021-01-30T05:00:00.000Z');
            res.body.results.should.have
              .property('endDate')
              .eql('2021-01-30T05:00:00.000Z');
            done();
          });
      });
    });

    /*
     * Test the /GET/drawsforticket/:id route
     */
    describe('/GET results and draws remaining for a specific set of playednumbers', () => {
      it('it should get results and draws remaining specific set of playednumbers', (done) => {
        chai
          .request(app)
          .get(`/api/v1/lottery/drawsforticket/${newId}`)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.length.should.be.a('number');
            res.body.results.should.be.a('array');
            res.body.remaining.should.be.a('number');
            done();
          });
      });
    });

    /*
     * Test the /DELETE/numbersplayed/:id route
     */
    describe('/DELETE a specific set of playednumbers', () => {
      it('it should delete a specific set of playednumbers', (done) => {
        chai
          .request(app)
          .delete(`/api/v1/lottery/numbersplayed/${newId}`)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('message').eql('Deleted ticket.');
            done();
          });
      });
    });

    /*
     * Test the /POST/numbersplayed route
     */
    describe('/POST Post a new set of numbers to playednumbers with an invalid sequence of numbers', () => {
      const body = {
        game: 'P',
        first: 7,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        ball: 6,
        startDate: '01-29-2021',
        endDate: '1-29-2021'
      };
      it('it should NOT POST a new set of numbers to playednumbers with invalid sequence of numbers', (done) => {
        chai
          .request(app)
          .post('/api/v1/lottery/numbersplayed')
          .send(body)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.message.should.equal(
              'Invalid set of numbers passed in.  Unable to create record.'
            );
            done();
          });
      });
    });

    /*
     * Test the /POST/numbersplayed route
     */
    describe('/POST Post a new set of numbers to playednumbers with an invalid date for lottery', () => {
      const body = {
        game: 'M',
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        ball: 6,
        startDate: '01-28-2021',
        endDate: '1-29-2021'
      };
      it('it should NOT POST a new set of numbers to playednumbers with invalid date for lottery', (done) => {
        chai
          .request(app)
          .post('/api/v1/lottery/numbersplayed')
          .send(body)
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.message.should.equal(
              'Invalid start date or end date passed in for the game.  Unable to create record.'
            );
            done();
          });
      });
    });
  });

  describe('------WINNING NUMBERS------', () => {
    /*
     * Test the /GET/winningnumbers route
     */
    describe('/GET Get all lottery winningnumbers', () => {
      it('it should GET all winning numbers from the db', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/winningnumbers')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.results.should.be.a('array');
            res.body.count.should.be.a('number');
            done();
          });
      });
    });
  });

  describe('------CHECK UPCOMING------', () => {
    /*
     * Test the /GET/checkupcoming route
     */
    // NOTE: Skipping because of the limited calls I can make.
    /*
    describe('/GET Get all lottery checkupcoming', () => {
      it('it should GET all winning numbers from the db', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/checkupcoming')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('pbResult');
            res.body.should.have.property('megaResult');
            done();
          });
      });
    });
    */
  });

  describe('------NOT FOUND------', () => {
    /*
     * Test the /GET/winningnumbers route
     */
    describe('/GET Get for route not found', () => {
      it('it should return an error for route not found', (done) => {
        chai
          .request(app)
          .get('/api/v1/lottery/someunkownroute')
          .end((err, res) => {
            if (err) {
              console.log(err);
            }
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have
              .property('error')
              .eql('Could not find this route');
            done();
          });
      });
    });
  });
});
