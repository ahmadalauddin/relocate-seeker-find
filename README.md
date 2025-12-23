# Career Navigator

> A Chrome extension that automatically detects relocation assistance and job type information on job posting sites.

## Features

- 🌍 **Relocation Detection**: Identifies visa sponsorship, relocation packages, and moving assistance
- 💼 **Job Type Classification**: Detects remote, hybrid, on-site, contract, and permanent positions
- 🎯 **Smart Analysis**: Hybrid approach using keyword matching + AI (GPT-4o-mini) for uncertain cases
- 💰 **Cost Optimized**: 99.93% reduction in API costs compared to original implementation
- 🔒 **Secure Configuration**: API keys stored in `.env` file (never committed)
- 🌐 **Universal Support**: Works on any job site with targeted URL patterns

## Supported Job Sites

The extension activates on URLs containing:
- `/jobs/*`
- `/job/*`
- `/careers/*`
- `/career/*`
- `/vacancies/*`
- `/vacancy/*`
- `/opportunities/*`

This includes sites like LinkedIn, Indeed, Glassdoor, Monster, ZipRecruiter, Seek, and many more!

## Installation

### 1. Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd relocate-seeker-find
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

**.env file**:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ENABLE_AI_ANALYSIS=true  # Set to 'false' for keyword-only mode
```

### 4. Build the extension
```bash
npm run build
```

This will:
- Build the React marketing site
- Generate `public/config.js` with your environment variables
- Prepare the extension for loading in Chrome

### 5. Load in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `public/` folder from this project

## Configuration Options

### AI-Powered Analysis (Recommended)
```bash
VITE_ENABLE_AI_ANALYSIS=true
VITE_OPENAI_API_KEY=your_key_here
```

**Benefits**:
- Highest accuracy for ambiguous job postings
- Only used when keyword matching is uncertain (~20-30% of cases)
- Cost: ~$0.0002-0.0005 per job analyzed

**Monthly Cost Estimates**:
- Light use (10 jobs/day): ~$0.05/month
- Moderate use (50 jobs/day): ~$0.23/month
- Heavy use (200 jobs/day): ~$0.90/month

### Keyword-Only Mode (Free)
```bash
VITE_ENABLE_AI_ANALYSIS=false
```

**Benefits**:
- Zero API costs
- Still effective for most job postings
- No OpenAI account needed

## How It Works

### Smart Hybrid Approach

1. **Content Extraction**: Extracts job description from the page (max 2000 chars)
2. **Caching**: Uses SHA-256 hashing to avoid re-analyzing same content
3. **Keyword Matching**: Tries keyword analysis first (free)
4. **AI Fallback**: If uncertain, uses GPT-4o-mini for deeper analysis
5. **Visual Indicator**: Displays color-coded badge with findings

### Analysis Flow

```
Job Page Loaded
     ↓
Extract Content (2000 chars max)
     ↓
Hash & Check Cache
     ↓
Try Keyword Matching (FREE)
     ↓
Clear Result? → YES → Display (No API call)
     ↓ NO
AI Enabled? → NO → Display keyword results
     ↓ YES
Call GPT-4o-mini API
     ↓
Cache & Display Results
```

## Token Usage Optimization

This extension is highly optimized for minimal API costs:

### Optimizations Implemented

1. **GPT-4o-mini Model**: 300x cheaper than GPT-4
2. **Content Truncation**: Limits to 2000 characters (~500 tokens)
3. **Keyword Pre-filtering**: 70-80% of jobs skip API entirely
4. **Optimized Prompt**: 23% shorter than original
5. **Smart Caching**: Never analyzes same content twice
6. **Configurable AI**: Can disable AI completely

**Result**: ~$0.01 per 100 jobs vs ~$15.00 before optimization!

See [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) for detailed breakdown.

## Development

### Start development server
```bash
npm run dev
```

This starts the React marketing site at `http://localhost:8080`.

**Note**: The actual extension runs in `public/` directory. The React app is just for marketing/landing page.

### Project Structure

```
relocate-seeker-find/
├── public/                    # Chrome Extension files
│   ├── manifest.json         # Extension configuration
│   ├── content.js            # Main analysis engine
│   ├── content.css           # Indicator styling
│   ├── popup.html/js         # Extension popup
│   └── config.js             # Generated from .env (built by Vite)
│
├── src/                       # React marketing site
│   ├── pages/                # Landing page
│   ├── components/           # UI components (shadcn-ui)
│   └── config.js             # Config template (builds to public/)
│
├── .env                       # Environment variables (gitignored)
├── .env.example              # Template for .env
└── vite.config.ts            # Build configuration
```

## Technologies Used

**Chrome Extension**:
- Vanilla JavaScript (ES6+)
- Chrome Extension Manifest v3
- OpenAI GPT-4o-mini API
- Content Scripts & Message Passing

**Marketing Site**:
- Vite 5.4
- React 18.3
- TypeScript
- Tailwind CSS
- shadcn-ui components

## Security

- ✅ API keys stored in `.env` file (gitignored)
- ✅ No hardcoded credentials in source code
- ✅ Config built at compile time, not runtime
- ✅ Minimal permissions (`activeTab`, `storage`)
- ✅ Only runs on job-related URLs

## Monitoring

Open Chrome DevTools (F12) on any job page to see logs:

- `"Using keyword analysis (confident match)"` = No API call
- `"Using AI analysis (uncertain case)"` = API call made
- `"AI analysis disabled, using keyword-only mode"` = AI disabled

## Troubleshooting

### Extension not working
1. Check that you ran `npm run build`
2. Ensure `public/config.js` exists
3. Verify `.env` file is configured correctly
4. Check Chrome DevTools console for errors

### No API key warning
```
OpenAI API key not found in config
```
**Solution**:
1. Create `.env` file from `.env.example`
2. Add your OpenAI API key
3. Run `npm run build` again
4. Reload extension in `chrome://extensions/`

### Content not detected
The extension looks for common job description selectors. If a site isn't working:
1. Check Chrome DevTools console for logs
2. The site may use uncommon HTML structure
3. Consider opening an issue with the URL

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use and modify!

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with** Vite + React + TypeScript + Tailwind CSS + OpenAI GPT-4o-mini
