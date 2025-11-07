# Contributing to Dokusho

First off, thank you for considering contributing to Dokusho! It's people like you that make open source such a great community. We welcome any and all contributions, from identifying bugs to proposing new features.

To ensure a smooth and collaborative process, we have established a few guidelines that we ask you to follow.

## Code of Conduct

This project and everyone participating in it is governed by the [Dokusho Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [yeeyuan.pro@mail.com].

## How Can I Contribute?

There are many ways to contribute to Dokusho, and we appreciate all of them.

### Reporting Bugs

If you encounter a bug, please help us by submitting an issue to our [GitHub Issues page](https://github.com/1klaimn/Dokusho/issues). A well-written bug report helps us resolve the issue faster. Please include the following:

*   **A clear and descriptive title:** "Bug: [A brief description of the bug]".
*   **A detailed description of the bug:** Explain what happened and what you expected to happen.
*   **Steps to reproduce:** Provide a step-by-step guide on how to reproduce the behavior.
*   **Screenshots or screen recordings:** If applicable, add visuals to help explain the problem.
*   **Your environment:** Include details about your operating system, browser, and its version.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, we'd love to hear it! Please submit an issue to our [GitHub Issues page](https://github.com/1klaimn/Dokusho/issues).

*   **A clear and descriptive title:** "Feature Request: [A brief description of the enhancement]".
*   **A detailed description of the enhancement:** Explain the feature and why it would be beneficial to the project.
*   **Mockups or examples:** If possible, include visuals or examples of how the feature would work.

### Your First Code Contribution

Ready to contribute code? Here’s how you can set up your environment and submit your changes.

1.  **Fork the repository:** Click the "Fork" button at the top right of the repository page.
2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/Dokusho.git
    ```
3.  **Navigate to the project directory:**
    ```bash
    cd Dokusho
    ```
4.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
5.  **Create a new branch:** Choose a descriptive name for your branch.
    ```bash
    git checkout -b feature/your-new-feature-name
    # or for bugs
    git checkout -b fix/bug-description
    ```
6.  **Make your changes:** Write your code and make your desired changes.
7.  **Commit your changes:** Use a clear and descriptive commit message.
    ```bash
    git commit -m "feat: Add new feature" -m "Detailed description of the changes."
    ```
8.  **Push to your branch:**
    ```bash
    git push origin feature/your-new-feature-name
    ```
9.  **Submit a Pull Request:** Open a pull request from your forked repository to the `main` branch of the `1klaimn/Dokusho` repository.

## Pull Request Guidelines

*   Please ensure your pull request includes a clear description of the problem and solution.
*   Link to any relevant issues in your pull request description.
*   Ensure your code follows the existing code style. We use Prettier for code formatting.
*   Update the `README.md` if your changes impact the documentation.
*   Your pull request will be reviewed by a maintainer, who may request changes.

## Styleguides

We use [Prettier](https://prettier.io/) to maintain a consistent code style across the project. Please ensure you have it set up in your editor or run `npm run format` before committing your changes.
