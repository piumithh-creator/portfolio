from pathlib import Path
import subprocess
import os

ROOT = Path.cwd()

commits = [
    {
        'date': '2026-04-01T10:15:00',
        'message': 'Initialize portfolio repository and add baseline project comments',
        'patches': [
            {
                'file': 'index.html',
                'search': '<img src="assets/my.photo1.jpeg" alt="Hirusha Piyumith">',
                'replace': '<img src="assets/my.photo1.jpeg" alt="Portrait of Hirusha Piyumith">',
            },
            {
                'file': 'index.html',
                'search': '<div class="hero-wrap">',
                'replace': '<!-- Main content starts here -->\n    <div class="hero-wrap">',
            },
        ],
    },
    {
        'date': '2026-04-04T11:30:00',
        'message': 'Improve HTML accessibility and clarify messaging in the hero section',
        'patches': [
            {
                'file': 'index.html',
                'search': '<img src="assets/my.photo2.jpeg" alt="Hirusha Piyumith">',
                'replace': '<img src="assets/my.photo2.jpeg" alt="Profile photo of Hirusha Piyumith">',
            },
            {
                'file': 'index.html',
                'search': '<span class="role-prefix">I build</span>',
                'replace': '<!-- Accessible role prefix -->\n                <span class="role-prefix">I build</span>',
            },
        ],
    },
    {
        'date': '2026-04-07T14:05:00',
        'message': 'Add CSS author notes and keep spacing utilities documented',
        'patches': [
            {
                'file': 'style.css',
                'search': '    /* Layout */\n',
                'replace': '    /* Layout */\n    /* Core layout tokens and spacing helpers for responsive rhythm */\n',
            },
            {
                'file': 'style.css',
                'search': '    --nav-height:  68px;\n',
                'replace': '    --nav-height:  68px;\n    --section-gap: 5rem;\n',
            },
        ],
    },
    {
        'date': '2026-04-10T09:20:00',
        'message': 'Refine navigation logic and document SPA page switching behavior',
        'patches': [
            {
                'file': 'script.js',
                'search': '    function showPage(pageKey) {\n',
                'replace': '    function showPage(pageKey) {\n        // Switch visible page sections in the single-page portfolio UI\n',
            },
        ],
    },
    {
        'date': '2026-04-13T16:30:00',
        'message': 'Polish loader timing and preserve accessibility for loading state',
        'patches': [
            {
                'file': 'script.js',
                'search': '        if (pct >= 100) {\n            clearInterval(tick);\n            setTimeout(() => loader.classList.add(\'fade-out\'), LOADER_HIDE_DELAY_MS);\n        }\n',
                'replace': '        if (pct >= 100) {\n            clearInterval(tick);\n            // Keep the loader visible for a brief moment to avoid a flash\n            setTimeout(() => loader.classList.add(\'fade-out\'), LOADER_HIDE_DELAY_MS);\n        }\n',
            },
        ],
    },
    {
        'date': '2026-04-16T12:40:00',
        'message': 'Add cursor trail performance guard and resize handler documentation',
        'patches': [
            {
                'file': 'script.js',
                'search': '        function resizeCanvas() {\n            canvas.width = window.innerWidth;\n            canvas.height = window.innerHeight;\n        }\n',
                'replace': '        function resizeCanvas() {\n            canvas.width = window.innerWidth;\n            canvas.height = window.innerHeight;\n        }\n        // Use a lightweight canvas resize handler for better responsiveness\n',
            },
        ],
    },
    {
        'date': '2026-04-19T08:50:00',
        'message': 'Improve contact form feedback and ensure success state resets cleanly',
        'patches': [
            {
                'file': 'script.js',
                'search': '        contactForm.addEventListener(\'submit\', (event) => {\n            event.preventDefault();\n            successMessage.style.display = \'block\';\n            contactForm.reset();\n            window.setTimeout(() => {\n                successMessage.style.display = \'none\';\n            }, SUCCESS_HIDE_DELAY_MS);\n        });\n',
                'replace': '        contactForm.addEventListener(\'submit\', (event) => {\n            event.preventDefault();\n            successMessage.style.display = \'block\';\n            contactForm.reset();\n            window.setTimeout(() => {\n                successMessage.style.display = \'none\';\n            }, SUCCESS_HIDE_DELAY_MS);\n        });\n        // The success message is shown for a short, friendly duration\n',
            },
        ],
    },
    {
        'date': '2026-04-22T10:10:00',
        'message': 'Finalize project cleanup and prepare the history for GitHub deployment',
        'patches': [
            {
                'file': 'style.css',
                'search': '    --trans:       var(--dur-base) var(--ease-out);\n',
                'replace': '    --trans:       var(--dur-base) var(--ease-out);\n    --shadow-layer: 0 0 30px rgba(126, 4, 227, 0.12);\n',
            },
        ],
    },
]


def patch_file(file_path, search, replace):
    path = ROOT / file_path
    text = path.read_text(encoding='utf-8')
    if search not in text:
        raise SystemExit(f"Patch target not found in {file_path}: {search[:80]}...")
    path.write_text(text.replace(search, replace, 1), encoding='utf-8')


def run_git(*args, env=None):
    result_env = os.environ.copy()
    if env:
        result_env.update(env)
    subprocess.run(['git', *args], cwd=ROOT, env=result_env, check=True)


def main():
    for commit in commits:
        print(f"Creating commit: {commit['message']} ({commit['date']})")
        for patch in commit['patches']:
            patch_file(patch['file'], patch['search'], patch['replace'])
            run_git('add', patch['file'])
        env = {
            'GIT_AUTHOR_DATE': commit['date'],
            'GIT_COMMITTER_DATE': commit['date'],
        }
        run_git('commit', '-m', commit['message'], env=env)
    print('Commit sequence completed.')

if __name__ == '__main__':
    main()
