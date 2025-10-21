/**
 * Security measures to prevent inspection and protect sensitive data
 */

// Anti-inspection measures
(function() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function(e) {
        if (
            // F12 key
            e.keyCode === 123 || 
            // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
            // Ctrl+Shift+J
            (e.ctrlKey && e.shiftKey && e.keyCode === 74) || 
            // Ctrl+U
            (e.ctrlKey && e.keyCode === 85)
        ) {
            e.preventDefault();
            return false;
        }
    });

    // Detect DevTools opening
    const devToolsDetector = {
        isOpen: false,
        orientation: undefined,
        
        // Check for DevTools via console.log timing
        checkDevTools: function() {
            const threshold = 160;
            const before = performance.now();
            console.log('%c', 'padding: 1px; margin: 0; line-height: 0; display: block;');
            const after = performance.now();
            const diff = after - before;
            
            if (diff > threshold) {
                // DevTools likely open
                this.isOpen = true;
                this.emitWarning();
            } else {
                this.isOpen = false;
            }
            
            return this.isOpen;
        },
        
        // Emit warning when DevTools detected
        emitWarning: function() {
            if (this.isOpen) {
                document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><h1>Security Alert</h1><p>For security reasons, developer tools access is restricted.</p></div>';
            }
        },
        
        // Initialize detection
        init: function() {
            setInterval(this.checkDevTools.bind(this), 1000);
            window.addEventListener('resize', this.checkDevTools.bind(this));
        }
    };

    // Start DevTools detection
    devToolsDetector.init();
    
    // Clear sensitive data from console
    console.clear();
    
    // Override console methods to prevent logging
    const consoleOverrides = ['log', 'info', 'warn', 'error', 'debug', 'table'];
    consoleOverrides.forEach(method => {
        const originalMethod = console[method];
        console[method] = function() {
            // Allow only specific messages (like our own security checks)
            if (arguments[0] === '%c') {
                return originalMethod.apply(console, arguments);
            }
            return undefined; // Suppress other console output
        };
    });
    
    // Obfuscate DOM elements with sensitive data
    function obfuscateSensitiveData() {
        // Find elements with sensitive data (phone numbers, emails, etc.)
        const sensitiveElements = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');
        
        sensitiveElements.forEach(element => {
            // Store original data in an encrypted format
            const originalText = element.textContent;
            const originalHref = element.getAttribute('href');
            
            // Replace visible text with a placeholder
            if (element.href.startsWith('tel:')) {
                element.textContent = 'Call me';
                
                // Add click handler to reveal actual number only when clicked
                element.addEventListener('click', function(e) {
                    // The actual number is used only at click time
                    // and not stored in the DOM
                    window.location.href = originalHref;
                    e.preventDefault();
                });
                
                // Remove the actual href to prevent it from being visible in status bar
                element.removeAttribute('href');
                element.style.cursor = 'pointer';
            }
        });
    }
    
    // Run obfuscation after DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', obfuscateSensitiveData);
    } else {
        obfuscateSensitiveData();
    }
    
    // Add CSS to prevent inspection of specific elements
    const style = document.createElement('style');
    style.textContent = `
        /* Prevent selection of sensitive elements */
        .secure-content {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        
        /* Hide elements from view source but keep them visible */
        .obfuscated::after {
            content: attr(data-content);
        }
    `;
    document.head.appendChild(style);
})();