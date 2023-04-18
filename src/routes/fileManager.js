module.exports = function(app) {
    app.get('/filemanager', (req, res) => {
        res.render('filemanager');
    });
}