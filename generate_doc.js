const fs = require('fs');
const path = require('path');

// Paths
const readmePath = path.join(__dirname, 'README.md');
const outputPath = path.join(__dirname, 'view_readme.html');

if (!fs.existsSync(readmePath)) {
  console.error('Error: README.md not found in the root directory.');
  process.exit(1);
}

// Read README.md
const markdownContent = fs.readFileSync(readmePath, 'utf8');

// Escape markdown text so it can safely sit inside a JS template literal
const escapedMarkdown = markdownContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\${/g, '\\${');

// HTML Template
const htmlTemplate = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduAdmin Platform - Interactive Documentation</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Prism.js for code highlighting -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" id="prism-theme" />
  
  <!-- MarkedJS for Markdown Parsing -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
            mono: ['"Fira Code"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#eef2ff',
              100: '#e0e7ff',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
            },
            secondary: {
              500: '#a855f7',
            }
          }
        }
      }
    }
  </script>

  <style>
    /* Premium Glassmorphism & Custom scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 999px;
    }
    .glass-nav {
      backdrop-filter: blur(16px);
      background-color: rgba(15, 23, 42, 0.7);
    }
    .light .glass-nav {
      background-color: rgba(255, 255, 255, 0.8);
    }
    
    /* Markdown Styles overriding */
    .prose table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.875rem;
    }
    .prose th {
      font-weight: 700;
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid #e2e8f0;
      background: rgba(99, 102, 241, 0.05);
    }
    .dark .prose th {
      border-bottom: 2px solid #334155;
      background: rgba(99, 102, 241, 0.1);
    }
    .prose td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .dark .prose td {
      border-bottom: 1px solid #334155;
    }
    .prose tr:hover {
      background: rgba(99, 102, 241, 0.02);
    }
    .dark .prose tr:hover {
      background: rgba(99, 102, 241, 0.04);
    }
    
    /* GitHub alerts styling */
    .alert-box {
      border-left-width: 4px;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      border-radius: 0 0.75rem 0.75rem 0;
    }
    .alert-note {
      border-left-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.05);
    }
    .alert-tip {
      border-left-color: #10b981;
      background-color: rgba(16, 185, 129, 0.05);
    }
    .alert-important {
      border-left-color: #a855f7;
      background-color: rgba(168, 85, 247, 0.05);
    }
    .alert-warning {
      border-left-color: #f59e0b;
      background-color: rgba(245, 158, 11, 0.05);
    }
    .alert-caution {
      border-left-color: #ef4444;
      background-color: rgba(239, 68, 68, 0.05);
    }
  </style>
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 antialiased font-sans">

  <!-- Header -->
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 glass-nav transition-all duration-300">
    <div class="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <div>
          <span class="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-500 to-secondary-500 bg-clip-text text-transparent">EduAdmin</span>
          <span class="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1.5 uppercase tracking-widest hidden sm:inline-block">Client Documentation</span>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative max-w-md w-full hidden md:block">
        <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          id="search-input"
          type="text" 
          placeholder="Search documentation (press '/' to focus)..." 
          class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-slate-300"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Dark Mode Toggle -->
        <button 
          id="theme-toggle" 
          class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-500 dark:text-slate-400"
          title="Toggle Theme"
        >
          <!-- Moon Icon -->
          <svg id="theme-moon" class="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <!-- Sun Icon -->
          <svg id="theme-sun" class="w-4 h-4 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m2.828-12.728l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
        </button>

        <a 
          href="https://github.com" 
          target="_blank"
          class="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 transition-all"
        >
          Codebase
        </a>
      </div>
    </div>
  </header>

  <!-- Container -->
  <div class="max-w-[1600px] mx-auto px-6 flex">
    
    <!-- Sidebar Navigation -->
    <aside class="w-64 shrink-0 hidden lg:block border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto py-8 pr-4">
      <div class="space-y-6" id="sidebar-nav">
        <!-- Navigation Groups injected here -->
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
          <div class="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2"></div>
          <div class="h-3 bg-slate-100 dark:bg-slate-900 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 dark:bg-slate-900 rounded w-5/6"></div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0 py-8 lg:px-12">
      <!-- Article -->
      <article 
        id="readme-content" 
        class="prose prose-slate dark:prose-invert max-w-none 
               prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
               prose-h1:text-4xl prose-h1:mb-6 prose-h1:font-extrabold prose-h1:bg-gradient-to-r prose-h1:from-brand-500 prose-h1:to-secondary-500 prose-h1:bg-clip-text prose-h1:text-transparent
               prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-12 prose-h2:mb-4
               prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
               prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:my-4
               prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline
               prose-code:text-brand-600 dark:prose-code:text-brand-400 prose-code:font-mono prose-code:text-xs prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-slate-100 dark:prose-code:bg-slate-900 prose-code:rounded
               prose-code:before:content-none prose-code:after:content-none
               prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-2xl prose-pre:p-0 prose-pre:my-6
               prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
               prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
               prose-li:my-1.5 prose-li:text-slate-600 dark:prose-li:text-slate-400
               prose-strong:font-semibold prose-strong:text-slate-800 dark:prose-strong:text-slate-100
               transition-colors duration-300"
      >
        <!-- Markdown parsed HTML will be outputted here -->
        <div class="flex justify-center items-center h-96">
          <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-medium text-slate-500">Compiling interactive view...</p>
          </div>
        </div>
      </article>
    </main>

    <!-- On This Page Navigation -->
    <aside class="w-64 shrink-0 hidden xl:block border-l border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto py-8 pl-6">
      <div class="space-y-4">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">On This Page</p>
        <nav id="on-this-page" class="space-y-2">
          <!-- Heading links dynamically injected here -->
        </nav>
      </div>
    </aside>
  </div>

  <!-- Raw Markdown script holder -->
  <script id="raw-markdown" type="text/markdown">${escapedMarkdown}</script>

  <!-- Marked and prism JS libraries -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-sql.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-env.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-dart.min.js"></script>

  <script>
    // Theme Management
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    themeToggle.addEventListener('click', () => {
      if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    });

    // Check system preference
    if (localStorage.getItem('theme') === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
      htmlEl.classList.remove('dark');
    } else {
      htmlEl.classList.add('dark');
    }

    // Markdown Compilation Config
    const md = document.getElementById('raw-markdown').textContent;
    
    // Custom renderer for marked to output styled components
    const renderer = new marked.Renderer();

    // 1. Heading renderer (Adds anchor link IDs)
    renderer.heading = function(text, level) {
      const slug = text.toLowerCase()
        .replace(/[^\\w\\s\\-]/g, '')
        .replace(/\\s+/g, '-');
      
      // We render anchor links
      return \`<h\${level} id="\${slug}" class="group scroll-mt-24">\${text}<a href="#\${slug}" class="opacity-0 group-hover:opacity-100 ml-2 text-brand-500 transition-opacity">#</a></h\${level}>\`;
    };

    // 2. Alert renderer (Converts > [!NOTE] to alert box)
    renderer.blockquote = function(quote) {
      let alertClass = 'alert-note';
      let title = 'Note';
      let icon = '<svg class="w-4 h-4 inline-block mr-1.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
      
      const cleanQuote = quote.replace(/<p>\\s*/, '<p>');
      
      if (cleanQuote.includes('[!NOTE]')) {
        alertClass = 'alert-note alert-box text-blue-800 dark:text-blue-200 border-blue-500 dark:border-blue-400';
        title = 'NOTE';
      } else if (cleanQuote.includes('[!TIP]')) {
        alertClass = 'alert-tip alert-box text-emerald-800 dark:text-emerald-200 border-emerald-500 dark:border-emerald-400';
        title = 'TIP';
        icon = '<svg class="w-4 h-4 inline-block mr-1.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>';
      } else if (cleanQuote.includes('[!IMPORTANT]')) {
        alertClass = 'alert-important alert-box text-purple-800 dark:text-purple-200 border-purple-500 dark:border-purple-400';
        title = 'IMPORTANT';
        icon = '<svg class="w-4 h-4 inline-block mr-1.5 mr-1.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-9.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>';
      } else if (cleanQuote.includes('[!WARNING]')) {
        alertClass = 'alert-warning alert-box text-amber-800 dark:text-amber-200 border-amber-500 dark:border-amber-400';
        title = 'WARNING';
        icon = '<svg class="w-4 h-4 inline-block mr-1.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
      } else if (cleanQuote.includes('[!CAUTION]')) {
        alertClass = 'alert-caution alert-box text-rose-800 dark:text-rose-200 border-rose-500 dark:border-rose-400';
        title = 'CAUTION';
        icon = '<svg class="w-4 h-4 inline-block mr-1.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
      } else {
        return \`<blockquote class="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-1 italic my-4 text-slate-500">\${quote}</blockquote>\`;
      }
      
      const formattedQuote = cleanQuote
        .replace(/\\s*\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\]\\s*/, '')
        .replace(/<p>/, \`<p class="text-sm font-semibold flex items-center gap-1 mb-1">\${icon}\${title}</p><p class="text-sm opacity-90 leading-relaxed">\`);
        
      return \`<div class="\${alertClass}">\${formattedQuote}</div>\`;
    };

    // 3. Code Block renderer with custom container & copy button
    renderer.code = function(code, lang) {
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const language = lang || 'text';
      
      return \`<div class="relative group mt-6 mb-6">
        <div class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1.5">
          <span class="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 uppercase">\${language}</span>
          <button class="copy-btn p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Copy code">
            <svg class="w-3.5 h-3.5 copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            <svg class="w-3.5 h-3.5 check-icon hidden text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
        <pre class="overflow-x-auto rounded-xl p-4 bg-slate-950 border border-slate-200 dark:border-slate-900 text-xs line-numbers"><code class="language-\${language}">\${escapedCode}</code></pre>
      </div>\`;
    };

    marked.setOptions({ renderer });

    // Render markdown content
    document.getElementById('readme-content').innerHTML = marked.parse(md);

    // Initial code highlighting using Prism
    Prism.highlightAll();

    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preEl = btn.closest('.group').querySelector('pre');
        const codeText = preEl.textContent.trim();
        
        navigator.clipboard.writeText(codeText).then(() => {
          const copyIcon = btn.querySelector('.copy-icon');
          const checkIcon = btn.querySelector('.check-icon');
          
          copyIcon.classList.add('hidden');
          checkIcon.classList.remove('hidden');
          
          setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
          }, 2000);
        });
      });
    });

    // Populate Sidebar Navigation & "On This Page" List
    const headings = Array.from(document.querySelectorAll('#readme-content h2, #readme-content h3'));
    const sidebarNav = document.getElementById('sidebar-nav');
    const onThisPage = document.getElementById('on-this-page');

    sidebarNav.innerHTML = '';
    onThisPage.innerHTML = '';

    let currentSectionDiv = null;

    headings.forEach(heading => {
      const text = heading.childNodes[0].textContent; // ignore # anchor link
      const id = heading.id;
      const level = heading.tagName.toLowerCase();

      // Right Sidebar - On This Page Link
      if (level === 'h2') {
        const link = document.createElement('a');
        link.href = '#' + id;
        link.className = 'block text-xs font-medium text-slate-500 hover:text-brand-500 transition-colors py-0.5 truncate pl-1 border-l border-transparent hover:border-brand-500';
        link.textContent = text;
        link.dataset.id = id;
        onThisPage.appendChild(link);
      }

      // Left Sidebar Navigation Builder
      if (level === 'h2') {
        currentSectionDiv = document.createElement('div');
        currentSectionDiv.className = 'space-y-2';
        
        const title = document.createElement('a');
        title.href = '#' + id;
        title.className = 'block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-brand-500 transition-colors mt-4 first:mt-0';
        title.textContent = text;
        currentSectionDiv.appendChild(title);
        
        const ul = document.createElement('ul');
        ul.className = 'space-y-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 ml-1';
        currentSectionDiv.appendChild(ul);
        
        sidebarNav.appendChild(currentSectionDiv);
      } else if (level === 'h3' && currentSectionDiv) {
        const ul = currentSectionDiv.querySelector('ul');
        if (ul) {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = '#' + id;
          link.className = 'block text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-white transition-colors truncate py-0.5';
          link.textContent = text;
          link.dataset.id = id;
          li.appendChild(link);
          ul.appendChild(li);
        }
      }
    });

    // Scrollspy Highlight logic
    const rightNavLinks = Array.from(document.querySelectorAll('#on-this-page a'));
    const sidebarNavLinks = Array.from(document.querySelectorAll('#sidebar-nav a'));

    window.addEventListener('scroll', () => {
      let activeId = '';
      const fromTop = window.scrollY + 120;

      headings.forEach(heading => {
        if (heading.offsetTop < fromTop) {
          activeId = heading.id;
        }
      });

      // Highlight active in right nav
      rightNavLinks.forEach(link => {
        if (link.dataset.id === activeId) {
          link.classList.add('text-brand-500', 'border-brand-500');
          link.classList.remove('text-slate-500');
        } else {
          link.classList.remove('text-brand-500', 'border-brand-500');
          link.classList.add('text-slate-500');
        }
      });

      // Highlight active in sidebar nav
      sidebarNavLinks.forEach(link => {
        if (link.dataset.id === activeId || link.getAttribute('href') === '#' + activeId) {
          link.classList.add('text-brand-500', 'dark:text-brand-400', 'font-semibold');
          link.classList.remove('text-slate-500', 'dark:text-slate-400');
        } else {
          link.classList.remove('text-brand-500', 'dark:text-brand-400', 'font-semibold');
          if (link.dataset.id) {
            link.classList.add('text-slate-500', 'dark:text-slate-400');
          }
        }
      });
    });

    // Search Engine Filter
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      const articles = document.querySelectorAll('#readme-content > *');
      
      if (!val) {
        // Show everything
        articles.forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#sidebar-nav li, #sidebar-nav div').forEach(el => el.classList.remove('hidden'));
        return;
      }
      
      // Filter elements
      let matches = new Set();
      
      // Check which headings or text contain the search term
      let lastHeading = null;
      articles.forEach(el => {
        const text = el.textContent.toLowerCase();
        const isMatch = text.includes(val);
        
        if (el.tagName.match(/^H[23]$/i)) {
          lastHeading = el;
        }
        
        if (isMatch) {
          el.classList.remove('hidden');
          matches.add(el.id);
          if (lastHeading) {
            lastHeading.classList.remove('hidden');
            matches.add(lastHeading.id);
          }
        } else {
          el.classList.add('hidden');
        }
      });
      
      // Show matching groups in sidebar, hide rest
      document.querySelectorAll('#sidebar-nav div').forEach(div => {
        const titleEl = div.querySelector('a');
        const listItems = div.querySelectorAll('li');
        let hasVisibleChild = false;
        
        listItems.forEach(li => {
          const a = li.querySelector('a');
          const headingId = a.dataset.id;
          const text = a.textContent.toLowerCase();
          
          if (matches.has(headingId) || text.includes(val)) {
            li.classList.remove('hidden');
            hasVisibleChild = true;
          } else {
            li.classList.add('hidden');
          }
        });
        
        const mainId = titleEl.getAttribute('href').replace('#', '');
        if (hasVisibleChild || matches.has(mainId) || titleEl.textContent.toLowerCase().includes(val)) {
          div.classList.remove('hidden');
        } else {
          div.classList.add('hidden');
        }
      });
    });

    // Hotkey: press '/' to focus search input
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  </script>
</body>
</html>
`;

// Write compiled HTML
fs.writeFileSync(outputPath, htmlTemplate);
console.log('✅ view_readme.html compiled successfully with embedded README.md contents!');
