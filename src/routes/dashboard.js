export default function dashboardRoute(app) {
    app.get('/filemanager', (req, res) => {
        res.render('filemanager', {
            footer_copyright_text:
                '&copy; ShadowBox 2023. For Internal Use Only',
        });
    });
}