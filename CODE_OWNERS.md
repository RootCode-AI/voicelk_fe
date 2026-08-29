# Code Owners

This file defines the code owners for the `voicelk_fe` project. 
To use this with GitHub or GitLab, you should copy the rules below into a `.github/CODEOWNERS` or `CODEOWNERS` file (without the `.md` extension).

```text
# This is a comment.
# Each line is a file pattern followed by one or more owners.

# These owners will be the default owners for everything in the repo.
*       @thari

# Order is important; the last matching pattern takes the most precedence.

# Frontend React files
/src/**/*.jsx              @thari
/src/**/*.js               @thari
/src/**/*.css              @thari

# Build & Config
/package.json              @thari
/vite.config.js            @thari
```

## Defining Owners
Owners can be defined using their GitHub/GitLab username (e.g., `@username`) or email address (e.g., `user@example.com`).

## More info
- [GitHub CODEOWNERS documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitLab CODEOWNERS documentation](https://docs.gitlab.com/ee/user/project/codeowners/)
