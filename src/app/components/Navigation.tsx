import Link from 'next/link';

interface NavigationProps {
    variant?: 'landing' | 'playground';
}

export default function Navigation({ variant = 'landing' }: NavigationProps) {
    return (
        <nav className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img 
                    src="/ip/logo.png" 
                    alt="Whiskers" 
                    className="h-9 w-auto"
                />
                <div className="flex flex-col justify-center">
                    <h1 className="text-white font-bold text-lg leading-tight">
                        {variant === 'playground' ? 'Whiskers Playground' : 'Whiskers'}
                    </h1>
                    <span className="text-gray-500 text-[10px] leading-tight">Real programming starts here</span>
                </div>
            </Link>

            <div className="flex items-center gap-3">
                {variant === 'landing' && (
                    <Link
                        href="/playground"
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-medium text-sm rounded-lg transition-all"
                    >
                        Try it now
                    </Link>
                )}
                
                {/* GitHub Logo Link */}
                <a
                    href="https://github.com/pcwu2022/scratch_compiler"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Contribute"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22" 
                        height="22"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                    </svg>
                </a>
            </div>
        </nav>
    );
}
