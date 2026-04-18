export interface RSSHubRouteSuggestion {
    namespace: string;
    name: string;
    path: string;
    example: string | null;
    description: string;
    category: string | undefined;
}

export const RSSHUB_BASE_URL = process.env.RSSHUB_BASE_URL || 'https://rss-hub-one-rose.vercel.app';

/**
 * Resolves a RSSHub route path to a full feed URL.
 * Example: '/maroelamedia/nuus' -> 'https://rsshub.example.com/maroelamedia/nuus'
 */
export function resolveRSSHubFeedUrl(routePath: string): string {
    if (routePath.startsWith('http://') || routePath.startsWith('https://')) {
        return routePath;
    }
    const origin = RSSHUB_BASE_URL.replace(/\/$/, "");
    const base = routePath.startsWith("/") ? routePath : `/${routePath}`;
    return `${origin}${base}`;
}

/**
 * Searches the RSSHub /api/rsshub/find endpoint for route suggestions.
 */
export async function findRSSHubRoutes(searchTerm: string): Promise<RSSHubRouteSuggestion[]> {
    if (!searchTerm?.trim()) {
        return [];
    }

    try {
        const origin = RSSHUB_BASE_URL.replace(/\/$/, "");
        const url = `${origin}/api/rsshub/find?s=${encodeURIComponent(searchTerm)}`;
        
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`RSSHub find API returned ${res.status}`);
            return [];
        }

        const data = await res.json();
        const suggestions: RSSHubRouteSuggestion[] = [];

        for (const [namespace, meta] of Object.entries(data)) {
            const castMeta = meta as any;
            if (castMeta.routes && Array.isArray(castMeta.routes)) {
                for (const route of castMeta.routes) {
                    const baseSuggestion = {
                        namespace,
                        name: castMeta.name || namespace,
                        path: `/${namespace}${route.path}`,
                        example: route.example ? resolveRSSHubFeedUrl(route.example) : null,
                        description: castMeta.description || route.name || '',
                        category: route.categories?.[0] || castMeta.categories?.[0],
                    };
                    
                    suggestions.push(baseSuggestion);

                    // If we have parameter options, recursively generate variants
                    const generateVariants = (currentPath: string, paramIndex: number, currentName: string) => {
                        const paramNames = Object.keys(route.parameters || {});
                        if (paramIndex >= paramNames.length) {
                            if (currentPath !== route.path) { // only push variant if it's different from base
                                const cleanPath = currentPath.replace(/\/:[a-zA-Z0-9_]+\??/g, '');
                                // Only add if no unresolved required parameters remain
                                if (!cleanPath.includes('/:')) {
                                    suggestions.push({
                                        ...baseSuggestion,
                                        name: currentName,
                                        path: `/${namespace}${cleanPath}`,
                                        example: null, 
                                    });
                                }
                            }
                            return;
                        }

                        const paramName = paramNames[paramIndex];
                        const pInfo = (route.parameters as any)[paramName];
                        
                        // Option 1: Path with this parameter left as is (or removed later by cleanPath)
                        generateVariants(currentPath, paramIndex + 1, currentName);
                        
                        // Option 2: Expanded paths based on parameter options
                        if (pInfo && pInfo.options && Array.isArray(pInfo.options)) {
                            for (const opt of pInfo.options) {
                                const regex = new RegExp(`/:${paramName}\\??(?=/|$)`, 'g');
                                if (regex.test(currentPath)) {
                                    const nextPath = currentPath.replace(regex, `/${opt.value}`);
                                    const nextName = currentName === (castMeta.name || namespace) 
                                        ? `${currentName} - ${opt.label || opt.value}` 
                                        : `${currentName} / ${opt.label || opt.value}`;
                                    generateVariants(nextPath, paramIndex + 1, nextName);
                                }
                            }
                        }
                    };

                    if (route.parameters) {
                        generateVariants(route.path, 0, castMeta.name || namespace);
                    }
                }
            }
        }

        return suggestions;
    } catch (e) {
        console.error('Error fetching RSSHub routes:', e);
        return [];
    }
}
