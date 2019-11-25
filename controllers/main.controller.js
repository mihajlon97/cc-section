const { ReE, ReS, to, asyncForEach }         = require('../services/UtilService');
const axios = require('axios');

/** POST Body Example
	{
		 "persons":[
			 {
			 "age":"8-12",
			 "gender":"male",
			 "timestamp":"2010-10-14T11:19:18.039111Z",
			 "section":"1",
			 "event":"exit"
			 }
		 ],
		 "extra-info": "" (optional)
	}
 */
const create = async function(req, res){
	const low = require('lowdb')
	const FileSync = require('lowdb/adapters/FileSync')
	const adapter = new FileSync('db.json')
	const db = low(adapter)

	const body = req.body;
	if (!body.persons) return ReE(res, { message: 'INVALID_DATA' });
	body.persons.forEach(person => {
		// Flag departed true/false depending if
		person.departed = person.event === 'exit';
		db.get('persons').push(person).write();
	});

	return ReS(res, {message: 'Created Person'});
};
module.exports.create = create;


// GET Example: /persons?from={from}&to={to}&aggregate=count&departed=false
const get = async function(req, res){
	const low = require('lowdb')
	const FileSync = require('lowdb/adapters/FileSync')
	const adapter = new FileSync('db.json')
	const db = low(adapter)

	var persons = db.get('persons').value();
	var result = [];


	persons.forEach(person => {

		if (
			// Time filter
			(req.query.from === undefined || req.query.from && new Date(req.query.from) <= new Date(person.timestamp)) &&
			(req.query.to === undefined || req.query.to && new Date(req.query.to) >= new Date(person.timestamp)) &&

			// Filter Departed
			(
				req.query.departed === undefined ||
				(req.query.departed === 'false' && person.event === 'entry') ||
				(req.query.departed === 'true' && person.event === 'exit')
			)
		) {
			result.push(person);
		}
	});

	// Aggregate response
	if (req.query.aggregate === 'count') result = result.length;

	return ReS(res, {persons: result});
};
module.exports.get = get;
