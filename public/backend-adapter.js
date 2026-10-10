class BackendAdapter {
    static get isTauri() {
        return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
    }

    static get isElectron() {
        return typeof window !== 'undefined' && window.api !== undefined;
    }

    static async invokeCompile(latexCode) {
        if (this.isTauri) {
            console.log("Using Tauri IPC for compile");
            try {
                const response = await window.__TAURI__.core.invoke('compile_latex', { code: latexCode });
                if (response.pdf_buffer) {
                    const arrayBuffer = new Uint8Array(response.pdf_buffer).buffer;
                    return { pdfBuffer: arrayBuffer, log: response.log };
                }
                return { error: response.error || response.log || 'Compilation failed' };
            } catch (err) {
                return { error: err.toString() };
            }
        } else if (this.isElectron) {
            console.log("Using Electron IPC for compile");
            return await window.api.compile(latexCode);
        } else {
            console.log("Using HTTP Fetch for compile");
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: latexCode })
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                return { pdfBuffer: arrayBuffer };
            } else {
                const data = await response.json().catch(() => ({}));
                return { error: data.log || data.error || 'Unknown compilation failure' };
            }
        }
    }

    static async invokeSyncTeX(pageNum, pdfX, pdfY) {
        if (this.isTauri) {
            console.log("Using Tauri IPC for SyncTeX");
            try {
                return await window.__TAURI__.core.invoke('synctex', { page: pageNum, x: pdfX, y: pdfY });
            } catch (err) {
                console.error("Tauri SyncTeX error:", err);
                return null;
            }
        } else if (this.isElectron) {
            console.log("Using Electron IPC for SyncTeX");
            return await window.api.synctex(pageNum, pdfX, pdfY);
        } else {
            console.log("Using HTTP Fetch for SyncTeX");
            const response = await fetch('/api/synctex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: pageNum,
                    x: pdfX,
                    y: pdfY
                })
            });
            if (response.ok) {
                return await response.json();
            }
            return null;
        }
    }
    static async invokeSavePdf(currentPdfUrl) {
        if (this.isTauri) {
            console.log("Using Tauri IPC for save PDF");
            try {
                return await window.__TAURI__.core.invoke('save_pdf');
            } catch (err) {
                console.error("Tauri save PDF error:", err);
                alert("Failed to save PDF: " + err);
                return false;
            }
        } else if (this.isElectron) {
            // Electron stub
            console.log("Using Electron IPC for save PDF");
            return false; 
        } else {
            console.log("Using HTTP Fetch for save PDF (fallback to browser download)");
            if (!currentPdfUrl) return false;
            const a = document.createElement('a');
            a.href = currentPdfUrl;
            a.download = 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return true;
        }
    }
}

window.BackendAdapter = BackendAdapter;
