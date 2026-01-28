import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Help & Support - Whiskers Playground",
    description: "Learn how Scratch Compiler saves and manages your projects",
};

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🐱</span>
                        <span className="font-bold text-lg">Scratch Compiler</span>
                    </Link>
                    <Link 
                        href="/"
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors text-sm"
                    >
                        ← Back to Editor
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-8">Help & Support</h1>

                {/* TL;DR - Quick Start */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-yellow-400">⚡ TL;DR - Quick Start Guide</h2>
                    <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-lg p-6">
                        <p className="text-lg mb-4">Here&apos;s how it works in 4 easy steps:</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Step 1 */}
                            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                <span className="text-3xl">1️⃣</span>
                                <div>
                                    <h3 className="font-bold text-green-400">Create or Open</h3>
                                    <p className="text-gray-300 text-sm">Click <strong>&quot;New Project&quot;</strong> to start fresh, or <strong>&quot;Open Project&quot;</strong> to load a saved one.</p>
                                </div>
                            </div>
                            
                            {/* Step 2 */}
                            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                <span className="text-3xl">2️⃣</span>
                                <div>
                                    <h3 className="font-bold text-blue-400">Write Code</h3>
                                    <p className="text-gray-300 text-sm">Type your Scratch code in the editor. It saves automatically - no need to click save!</p>
                                </div>
                            </div>
                            
                            {/* Step 3 */}
                            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                <span className="text-3xl">3️⃣</span>
                                <div>
                                    <h3 className="font-bold text-purple-400">Run & Play</h3>
                                    <p className="text-gray-300 text-sm">Watch your code run in the preview on the right side. Make changes and see them instantly!</p>
                                </div>
                            </div>
                            
                            {/* Step 4 */}
                            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                <span className="text-3xl">4️⃣</span>
                                <div>
                                    <h3 className="font-bold text-orange-400">Download to Keep</h3>
                                    <p className="text-gray-300 text-sm">Click the <strong>↓ download button</strong> → &quot;Save Project&quot; to get a .zip file you can keep forever!</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-5 p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                            <p className="text-sm">
                                💡 <strong>Remember:</strong> Your project lives in your browser. To share it with friends or use it on another computer, always <strong>download the .zip file</strong>!
                            </p>
                        </div>
                    </div>
                </section>

                {/* How Project Saving Works */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">💾 How Project Saving Works</h2>
                    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                        <p>
                            Scratch Compiler automatically saves your project to your browser&apos;s <strong>local storage</strong>. 
                            This means:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Your code is saved <strong>automatically</strong> as you type</li>
                            <li>Your project persists even after closing the browser</li>
                            <li>Data is stored <strong>only on your device</strong> - nothing is sent to a server</li>
                            <li>Each browser maintains its own separate storage</li>
                        </ul>
                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded p-4 mt-4">
                            <p className="text-yellow-200">
                                ⚠️ <strong>Important:</strong> Clearing your browser data or using private/incognito mode 
                                will erase your local storage. Always download your project if you want to keep it safe!
                            </p>
                        </div>
                    </div>
                </section>

                {/* Download Project */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-green-400">📥 Downloading Your Project</h2>
                    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                        <p>To save a backup of your project:</p>
                        <ol className="list-decimal list-inside space-y-3 ml-4">
                            <li>Click the <strong>Download</strong> button (↓) in the toolbar</li>
                            <li>Select <strong>&quot;Save Project (.zip)&quot;</strong></li>
                            <li>A ZIP file containing all your sprites will be downloaded</li>
                        </ol>
                        <p className="text-gray-400 text-sm mt-4">
                            The ZIP file contains:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400 text-sm">
                            <li><code>project.json</code> - Project metadata (name, version, etc.)</li>
                            <li><code>sprites/</code> folder - All your sprite code files (.scratch)</li>
                        </ul>
                    </div>
                </section>

                {/* Upload Project */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">📤 Opening a Project</h2>
                    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                        <p>To open a previously saved project:</p>
                        <ol className="list-decimal list-inside space-y-3 ml-4">
                            <li>Click the <strong>&quot;Open Project&quot;</strong> button</li>
                            <li>Select your <code>.zip</code> project file</li>
                            <li>If you have unsaved changes, you&apos;ll be prompted to save first</li>
                            <li>Your project will be loaded with all sprites restored</li>
                        </ol>
                        <p className="text-gray-400 text-sm mt-4">
                            You can also drag and drop a .zip file onto the page!
                        </p>
                    </div>
                </section>

                {/* New Project */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-orange-400">✨ Creating a New Project</h2>
                    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                        <p>To start fresh with a new project:</p>
                        <ol className="list-decimal list-inside space-y-3 ml-4">
                            <li>Click the <strong>&quot;New Project&quot;</strong> button</li>
                            <li>If you have unsaved changes, you&apos;ll be prompted to save first</li>
                            <li>Enter a name for your new project</li>
                            <li>A new project with a Stage and default Sprite will be created</li>
                        </ol>
                    </div>
                </section>

                {/* Import Sprite */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-cyan-400">🎭 Importing Sprites</h2>
                    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                        <p>To add a sprite from another project:</p>
                        <ol className="list-decimal list-inside space-y-3 ml-4">
                            <li>Click the <strong>Upload</strong> button (↑) in the toolbar</li>
                            <li>Select a <code>.scratch</code> sprite file</li>
                            <li>The sprite will be added to your current project</li>
                        </ol>
                        <p className="text-gray-400 text-sm mt-4">
                            You can also download individual sprites using the dropdown menu!
                        </p>
                    </div>
                </section>

                {/* Keyboard Shortcuts */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-pink-400">⌨️ Keyboard Shortcuts</h2>
                    <div className="bg-gray-800 rounded-lg p-6">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-2 text-gray-400">Shortcut</th>
                                    <th className="text-left py-2 text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                <tr className="border-b border-gray-700/50">
                                    <td className="py-3"><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">S</kbd></td>
                                    <td className="py-3">Save confirmation (project auto-saves)</td>
                                </tr>
                                <tr className="border-b border-gray-700/50">
                                    <td className="py-3"><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Space</kbd></td>
                                    <td className="py-3">Autocomplete suggestions</td>
                                </tr>
                                <tr>
                                    <td className="py-3"><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Esc</kbd></td>
                                    <td className="py-3">Exit fullscreen preview</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-emerald-400">❓ Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                            <summary className="font-semibold">Where is my data stored?</summary>
                            <p className="mt-3 text-gray-300">
                                Your project is stored in your browser&apos;s local storage. This means the data never leaves 
                                your computer and is not uploaded to any server.
                            </p>
                        </details>
                        <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                            <summary className="font-semibold">Can I access my project on another device?</summary>
                            <p className="mt-3 text-gray-300">
                                Local storage is device and browser specific. To transfer your project to another device, 
                                download it as a ZIP file and open it on the other device.
                            </p>
                        </details>
                        <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                            <summary className="font-semibold">What happens if I clear my browser data?</summary>
                            <p className="mt-3 text-gray-300">
                                Clearing browser data will erase your local storage, including your saved project. 
                                Always download a backup if you want to keep your work!
                            </p>
                        </details>
                        <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                            <summary className="font-semibold">Is there a file size limit?</summary>
                            <p className="mt-3 text-gray-300">
                                Browser local storage typically has a limit of 5-10MB. This is usually plenty for 
                                code-based projects, but very large projects might need to be downloaded regularly.
                            </p>
                        </details>
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-gray-500 text-sm pt-8 border-t border-gray-700">
                    <p>
                        Built with ❤️ using Next.js and Monaco Editor
                    </p>
                    <p className="mt-2">
                        <a 
                            href="https://github.com/pcwu2022/scratch_compiler" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Contribute
                        </a>
                    </p>
                </footer>
            </main>
        </div>
    );
}
