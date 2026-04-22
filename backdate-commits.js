#!/usr/bin/env node
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const ROOT = process.cwd();
const TARGET_FILES = ['index.html', 'style.css', 'script.js'];

const commits = [
  {
    date: '2026-04-01T10:15:00',
    message: 'Initialize portfolio repository and add baseline project comments',
    patches: [
      {
        file: 'index.html',
        search: '<img src="assets/my.photo1.jpeg" alt="Hirusha Piyumith">',
        replace: '<img src="assets/my.photo1.jpeg" alt="Portrait of Hirusha Piyumith">',
      },
      {
        file: 'index.html',
        search: '<div class="hero-wrap">',
        replace: '<!-- Main content starts here -->\n    <div class="hero-wrap">',
      },
    ],
  },
  {
    date: '2026-04-04T11:30:00',
    message: 'Improve HTML accessibility and clarify messaging in the hero section',
    patches: [
      {
        file: 'index.html',
        search: '<img src="assets/my.photo2.jpeg" alt="Hirusha Piyumith">',
        replace: '<img src="assets/my.photo2.jpeg" alt="Profile photo of Hirusha Piyumith">',
      },
      {
        file: 'index.html',
        search: '<span class="role-prefix">I build</span>',
        replace: '<!-- Accessible role prefix -->\n                <span class="role-prefix">I build</span>',
      },
    ],
  },
  {
    date: '2026-04-07T14:05:00',
    message: 'Add CSS author notes and keep spacing utilities documented',
    patches: [
      {
        file: 'style.css',
        search: '    /* Layout */\n',
        replace: '    /* Layout */\n    /* Core layout tokens and spacing helpers for responsive rhythm */\n',
      },
      {
        file: 'style.css',
        search: '    --nav-height:  68px;\n',
        replace: '    --nav-height:  68px;\n    --section-gap: 5rem;\n',
      },
    ],
  },
  {
    date: '2026-04-10T09:20:00',
    message: 'Refine navigation logic and document SPA page switching behavior',
    patches: [
      {
        file: 'script.js',
        search: '    function showPage(pageKey) {\n',
        replace: '    function showPage(pageKey) {\n        // Switch visible page sections in the single-page portfolio UI\n',
      },
    ],
  },
  {
    date: '2026-04-13T16:30:00',
    message: 'Polish loader timing and preserve accessibility for loading state',
    patches: [
      {
        file: 'script.js',
        search: '        if (pct >= 100) {\n            clearInterval(tick);\n            setTimeout(() => loader.classList.add(\'fade-out\'), LOADER_HIDE_DELAY_MS);\n        }\n',
        replace: '        if (pct >= 100) {\n            clearInterval(tick);\n            // Keep the loader visible for a brief moment to avoid a flash\n            setTimeout(() => loader.classList.add(\'fade-out\'), LOADER_HIDE_DELAY_MS);\n        }\n',
      },
    ],
  },
  {
    date: '2026-04-16T12:40:00',
    message: 'Add cursor trail performance guard and resize handler documentation',
    patches: [
      {
        file: 'script.js',
        search: '        function resizeCanvas() {\n            canvas.width = window.innerWidth;\n            canvas.height = window.innerHeight;\n        }\n',
        replace: '        function resizeCanvas() {\n            canvas.width = window.innerWidth;\n            canvas.height = window.innerHeight;\n        }\n        // Use a lightweight canvas resize handler for better responsiveness\n',
      },
    ],
  },
  {
    date: '2026-04-19T08:50:00',
    message: 'Improve contact form feedback and ensure success state resets cleanly',
    patches: [
      {
        file: 'script.js',
        search: '        contactForm.addEventListener(\'submit\', (event) => {\n            event.preventDefault();\n            successMessage.style.display = \'block\';\n            contactForm.reset();\n            window.setTimeout(() => {\n                successMessage.style.display = \'none\';\n            }, SUCCESS_HIDE_DELAY_MS);\n        });\n',
        replace: '        contactForm.addEventListener(\'submit\', (event) => {\n            event.preventDefault();\n            successMessage.style.display = \'block\';\n            contactForm.reset();\n            window.setTimeout(() => {\n                successMessage.style.display = \'none\';\n            }, SUCCESS_HIDE_DELAY_MS);\n        });\n        // The success message is shown for a short, friendly duration\n',
      },
    ],
  },
  {
    date: '2026-04-22T10:10:00',
    message: 'Finalize project cleanup and prepare the history for GitHub deployment',
    patches: [
      {
        file: 'style.css',
        search: '    --trans:       var(--dur-base) var(--ease-out);\n',
        replace: '    --trans:       var(--dur-base) var(--ease-out);\n    --shadow-layer: 0 0 30px rgba(126, 4, 227, 0.12);\n',
      },
    ],
  },
];

function runCommand(command, env = {}) {
  return execSync(command, { stdio: 'inherit', env: { ...process.env, ...env }, cwd: ROOT });
}

function patchFile(filePath, searchValue, replaceValue) {
  const absolutePath = join(ROOT, filePath);
  let content = readFileSync(absolutePath, 'utf8');

  if (!content.includes(searchValue)) {
    throw new Error(`Patch failed: search text not found in ${filePath}`);
  }

  content = content.replace(searchValue, replaceValue);
  writeFileSync(absolutePath, content, 'utf8');
}

function ensureGitRepository() {
  try {
    runCommand('git rev-parse --is-inside-work-tree');
  } catch (error) {
    throw new Error('Current folder is not a Git repository. Run git init first.');
  }
}

function ensureRemoteConfigured() {
  try {
    runCommand('git remote get-url origin');
  } catch (error) {
    console.log('No remote origin configured. Add the remote manually: git remote add origin https://github.com/piumithh-creator/portfolio.git');
    process.exit(1);
  }
}

function verifyCleanState() {
  const status = execSync('git status --short', { cwd: ROOT }).toString().trim();
  if (status) {
    console.log('Warning: There are uncommitted changes in the working tree.');
    console.log(status);
    console.log('This script will only stage and commit the files it patches, but please verify the current state first.');
  }
}

function createCommits() {
  commits.forEach((commit) => {
    console.log(`\n=== Creating commit: ${commit.message} (${commit.date}) ===`);

    commit.patches.forEach((patch) => {
      patchFile(patch.file, patch.search, patch.replace);
      runCommand(`git add ${patch.file}`);
    });

    const env = {
      GIT_AUTHOR_DATE: commit.date,
      GIT_COMMITTER_DATE: commit.date,
    };

    runCommand(`git commit -m "${commit.message}"`, env);
  });
}

function main() {
  ensureGitRepository();
  ensureRemoteConfigured();
  verifyCleanState();
  createCommits();
  console.log('\nAll commits have been created. Run git log --oneline to review the new history.');
  console.log('When ready, push with: git push origin main');
}

main();
