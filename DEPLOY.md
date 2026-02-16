# Deploying Multi-Project Portfolio to GitHub Pages

## 📚 Portfolio Structure

Your portfolio now has:
- **Homepage**: Portfolio landing page with project cards
- **Multi-Agent Explorer**: Interactive visualization of LLM agents and patterns
- **AWS Bedrock Agents**: Deep dive into AWS Bedrock architecture

## 🌐 Live URLs (After Deployment)

```
https://yourusername.github.io/GenAI_Concepts                      → Homepage
https://yourusername.github.io/GenAI_Concepts/#/multi-agent-explorer  → Multi-Agent Explorer
https://yourusername.github.io/GenAI_Concepts/#/bedrock-agents       → AWS Bedrock Agents
```

## ⚠️ IMPORTANT: Local Development vs GitHub Pages

**For local development:** Do NOT add the `homepage` field to package.json (it will break local dev server)

**For GitHub Pages deployment:** Add the `homepage` field ONLY when ready to deploy

## 💻 Local Development

Your app is configured for local development with React Router:

```bash
npm start
```

Visit:
- **Homepage**: http://localhost:3000
- **Multi-Agent Explorer**: http://localhost:3000/#/multi-agent-explorer
- **AWS Bedrock Agents**: http://localhost:3000/#/bedrock-agents

## 🚀 Deploying to GitHub Pages

### 1. Ensure gh-pages is installed
```bash
npm install --save-dev gh-pages
```

### 2. ONLY WHEN READY TO DEPLOY: Add homepage to package.json

Edit `package.json` and add this line after `"version": "0.1.0",`:
```json
"homepage": "https://yourusername.github.io/GenAI_Concepts",
```

**Replace `yourusername` with your actual GitHub username!**

**Example** (for username `kujalk`):
```json
"homepage": "https://kujalk.github.io/GenAI_Concepts",
```

### 3. Deploy
```bash
npm run deploy
```

This will:
- Build your React app with all projects
- Create/update a `gh-pages` branch
- Push the build folder to that branch
- Your portfolio goes live automatically!

### 4. Verify GitHub Pages Settings (First Time Only)

1. Go to your repository on GitHub: `https://github.com/yourusername/GenAI_Concepts`
2. Click **Settings** > **Pages**
3. Verify "Source" is set to `gh-pages` branch
4. Your site will be live at: `https://yourusername.github.io/GenAI_Concepts`

## ➕ Adding New Projects

### Step 1: Create Project Component

Create a new file: `src/pages/projects/YourProject.js`

Just paste your React content directly — **no need to import or wrap with Layout**.
The sidebar navigation is automatically applied by `App.js`.

```javascript
export default function YourProject() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Your Project Title</h1>
      <p className="text-gray-300">Your project content here...</p>
    </div>
  );
}
```

> **Note:** Layout (sidebar + navigation) is handled externally in `App.js` using
> React Router's layout route pattern. Project pages only contain their own content.

### Step 2: Register in Project Config

Edit `src/data/projects.js` and add your project:

```javascript
{
  id: "your-project",
  title: "Your Project Title",
  description: "What your project does - shown on homepage",
  icon: "🎯",  // Choose an emoji icon
  tags: ["React", "AI", "Whatever"],
  path: "/your-project",
}
```

### Step 3: Add Route

Edit `src/App.js` and add:

```javascript
// At top with other imports
import YourProject from './pages/projects/YourProject';

// Inside the <Route element={<Layout />}> section (NOT outside it)
<Route path="/your-project" element={<YourProject />} />
```

### Step 4: Deploy

```bash
npm run deploy
```

**Done!** Your new project is now live at:
`https://yourusername.github.io/GenAI_Concepts/#/your-project`

## 🔄 Updating Existing Projects

1. Edit the project file in `src/pages/projects/`
2. Test locally: `npm start`
3. Deploy: `npm run deploy`

## 📝 Updating Homepage

Edit `src/pages/Home.js` to change:
- Header text
- Description
- Footer
- Layout

Or edit `src/components/ProjectCard.js` to change card styling.

## 🛠️ For Continued Local Development

After deploying, if you want to continue local development:

**Option A (Recommended):**
- Remove the `homepage` line from package.json
- Work locally
- Add it back before deploying

**Option B:**
- Keep `homepage: "."` in package.json
- Works for both local and GitHub Pages with relative paths

## 🐛 Troubleshooting

### Issue: Blank page or styles not loading LOCALLY
**Cause**: The `homepage` field is set in package.json
**Solution**: Remove the `homepage` line from package.json and restart `npm start`

### Issue: Blank homepage on GitHub Pages
**Cause**: Missing `homepage` field or wrong URL
**Solution**:
1. Verify `homepage` field in package.json matches exactly: `https://yourusername.github.io/GenAI_Concepts`
2. Rebuild and redeploy: `npm run deploy`

### Issue: Projects work locally but 404 on GitHub Pages
**Cause**: Using BrowserRouter instead of HashRouter
**Solution**: Already fixed! The portfolio uses HashRouter which works perfectly with GitHub Pages.

### Issue: 404 errors for assets on GitHub Pages
**Solution**:
1. Check that the `homepage` URL is correct
2. Redeploy: `npm run deploy`

### Issue: Changes not appearing on GitHub Pages
**Solution**:
- Clear browser cache or use incognito mode
- GitHub Pages can take 2-5 minutes to update
- Try a hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Issue: ESLint warnings
**Solution**: Warnings are harmless. If you want to fix them:
```bash
# Remove unused imports
# Edit the file mentioned in the warning
```

## 📋 Quick Reference Commands

**Local development:**
```bash
npm start                 # Start dev server at localhost:3000
```

**Production build test:**
```bash
npm run build             # Create production build
npx serve -s build        # Test production build locally
```

**Deploy to GitHub Pages:**
```bash
# 1. Add homepage to package.json first!
# 2. Then run:
npm run deploy
```

**Add a new project:**
```bash
# 1. Create src/pages/projects/YourProject.js
# 2. Add to src/data/projects.js
# 3. Add route to src/App.js
# 4. npm run deploy
```

## 📚 Project Structure

```
src/
├── App.js                          # Router configuration
├── data/
│   └── projects.js                 # Project registry (EDIT HERE to add projects)
├── pages/
│   ├── Home.js                     # Portfolio homepage
│   ├── NotFound.js                 # 404 page
│   └── projects/
│       ├── MultiAgentExplorer.js   # Multi-Agent project
│       ├── BedrockAgents.js        # AWS Bedrock project
│       └── YourProject.js          # Your new projects go here
├── components/
│   ├── Layout.js                   # Sidebar navigation (auto-applied to project routes)
│   └── ProjectCard.js              # Reusable project card component
└── index.js                        # App entry point
```

## 🎯 Key Files for Customization

- **Add Projects**: `src/data/projects.js`
- **Homepage Style**: `src/pages/Home.js`
- **Card Style**: `src/components/ProjectCard.js`
- **Routing**: `src/App.js`
- **Deploy Settings**: `package.json` (homepage field)

## 💡 Tips

- **Testing locally first**: Always run `npm start` and test before deploying
- **Homepage field**: Only add when deploying, remove for local dev
- **HashRouter**: Uses `#` in URLs, works perfectly with GitHub Pages
- **Project cards**: Auto-populate from `src/data/projects.js`
- **Easy updates**: Edit one project, deploy entire portfolio
