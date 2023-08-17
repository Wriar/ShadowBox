export default function loginRoute(app) {
    app.get('/', (req, res) => {
        res.redirect('/login');
    });

    app.get('/login', (req, res) => {
        res.render('login', {
            footer_copyright_text: '&copy; ShadowBox 2023. For Internal Use Only'
        });
    });
}