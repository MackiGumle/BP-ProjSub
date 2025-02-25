import axios from "axios";

// This component is used to fetch files from the server with the token
export const ProtectedFileLink = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!href) return;

        try {
            const response = await axios.get(href, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const downloadUrl = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = href.split('/').pop() || 'download';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(downloadUrl);
            a.remove();
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    return <a href="#" onClick={handleDownload}>{children}</a>;
};