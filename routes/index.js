const MainController = require('../controllers/main.controller');

module.exports = function (express) {
	const router = express.Router();

	// ----------- Routes -------------
	router.post('/persons',           MainController.create);
	router.get('/persons',            MainController.get);

	return router;
};
