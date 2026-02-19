# Push this repo to GitHub

The project is committed locally on branch `main`. To put it on GitHub:

## 1. Create the repository on GitHub

- Go to [github.com/new](https://github.com/new).
- **Repository name:** `Progressive_Overload_Tracker` (or the name you prefer).
- Choose **Public** (or Private).
- **Do not** add a README, .gitignore, or license (this repo already has them).
- Click **Create repository**.

## 2. Add the remote and push

In a terminal, from this project folder:

```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/VinodGeorge24/Progressive_Overload_Tracker.git
git push -u origin main
```

If you use SSH:

```powershell
git remote add origin git@github.com:VinodGeorge24/Progressive_Overload_Tracker.git
git push -u origin main
```

## 3. (Optional) Use GitHub MCP in Cursor

After you set `GITHUB_PERSONAL_ACCESS_TOKEN` in Cursor’s MCP config (see `~/.cursor/mcp.json`), you can use Cursor’s GitHub MCP tools to create the repo and push from the IDE.
