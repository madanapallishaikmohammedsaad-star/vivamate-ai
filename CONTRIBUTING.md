# Contributing to VivaMate AI

Thank you for helping improve VivaMate AI.

## Local setup

1. Fork or clone the repository.
2. Create and activate a Python virtual environment.
3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend
   npm ci
   ```
5. Configure the backend environment using `backend/.env.example`.
6. Start the backend and frontend using the commands documented in `README.md`.

## Before opening a pull request

- Keep changes focused and easy to review.
- Do not commit secrets, `.env` files, generated databases, or build output.
- Run the frontend lint and build commands:
  ```bash
  npm run lint
  npm run build
  ```
- Update documentation when behavior or setup steps change.
- Include a clear description of what changed and how it was tested.

## Commit and pull request guidance

- Use a concise commit message that explains the change.
- Explain the motivation and user impact in the pull request description.
- Add screenshots or short recordings for meaningful UI changes when useful.
- Be respectful and constructive in reviews.
