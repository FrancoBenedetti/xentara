const route = {
    path: "/:category?",
    parameters: {
        category: { options: [{value: "nuus", label: "Nuus"}, {value: "vermaak", label: "Vermaak"}, {value: "vermaak/kos", label: "Kos"}] }
    }
};

const castMeta = { name: "Maroela Media" };
const namespace = "maroelamedia";

const generateVariants = (currentPath, paramIndex, currentName) => {
    const paramNames = Object.keys(route.parameters || {});
    if (paramIndex >= paramNames.length) {
        if (currentPath !== route.path) { // only push if it's different from base
            const cleanPath = currentPath.replace(/\/:[a-zA-Z0-9_]+\??/g, '');
            // Only add if no unresolved REQUIRED parameters
            if (!cleanPath.includes('/:')) {
                console.log({
                    namespace,
                    name: currentName,
                    path: `/${namespace}${cleanPath}`
                });
            }
        }
        return;
    }

    const paramName = paramNames[paramIndex];
    const pInfo = route.parameters[paramName];
    
    // Path with this parameter left alone/removed
    generateVariants(currentPath, paramIndex + 1, currentName);
    
    if (pInfo.options && Array.isArray(pInfo.options)) {
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

generateVariants(route.path, 0, castMeta.name || namespace);
