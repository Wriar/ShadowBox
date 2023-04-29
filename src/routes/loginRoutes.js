module.exports = function(app) {
    app.get('/login', (req, res) => {
        res.render('login', {
            //Define variables to be passed to the view here
            footer_copyright_text: `&copy; ${new Date().getFullYear()} ShadowBox Technologies. For internal use only. <b>System Version 0.0.1d</b>`
        });
    });
}