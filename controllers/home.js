//takes the browser's request and lets us send back a page or other information
var  ImageModel = require('../models').Image;
var sidebar = require('../helpers/sidebar');


module.exports = {

	//GRAB IMAGES AS A VIEW MODEL
    index: function(req, res) {
        var viewModel = {
            images: {},
            userName: req.user ? req.user.username : ''
        };

        ImageModel.find({}, {}, { sort: { timestamp: -1 }},
            function(err, images) {

                viewModel.images = images;
                sidebar(viewModel, function(viewModel) {
                    res.render('index', viewModel);
                });
            });
    }
};
