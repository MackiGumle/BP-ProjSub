import { useEffect, useState } from 'react';
import axios from 'axios';

// This component is used to fetch images from the server with the token
export const ProtectedImage = ({ src, alt }: { src?: string; alt?: string }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;

        const fetchImage = async () => {
            try {
                const response = await axios.get(src, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const url = URL.createObjectURL(response.data);
                setBlobUrl(url);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();

        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [src]);

    if (loading) return <div>Loading image...</div>;
    if (error) return <div>Error loading image</div>;
    if (!blobUrl) return null;

    return <img src={blobUrl} alt={alt} />;
};