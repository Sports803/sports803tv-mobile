# Sports803TV owner-control architecture decision

GitHub Pages can host an administration user interface, but it publishes static HTML, CSS, and JavaScript from a repository and cannot safely execute private server logic or hold service credentials. The owner-control design must therefore keep Firebase write credentials, advertising keys, publisher credentials, and administrative authorization on a protected backend.

| Option | Public component | Private component | Suitable for |
|---|---|---|---|
| Static administration site plus protected API | GitHub Pages dashboard | Existing Sports803TV backend with role-protected endpoints | Full owner control with secure Firebase writes, ad placement, featured content, and future integrations |
| Repository-managed configuration | GitHub Pages dashboard plus versioned JSON | GitHub Actions or controlled manual review | Small editorial workflow where changes can be reviewed and deployed deliberately |

The first option supports real-time operational controls. The second is lighter but does not support instant server-side actions or secret-backed integrations.

## Source

- [GitHub Docs — What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
