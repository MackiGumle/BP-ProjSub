import React from 'react'
import Uppy from '@uppy/core'
import { Dashboard, useUppyEvent } from '@uppy/react'
import XHR from '@uppy/xhr-upload';

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { useTheme } from '@/components/theme-components/theme-provider';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UppyDragDropProps {
    endpoint: string;
    invalidateQueries?: Array<Array<string | number>>;
    onUploadComplete?: () => void;
}

interface UploadSettings {
    maxFileSize: number;
    maxTotalSize: number;
    allowedExtensions: string[] | null;
    maxFiles: number;
}

interface UploadErrorResponse {
    body?: Record<string, any>;
    status: number;
    bytesUploaded?: number;
    response: {
        message: string;
    };
}


export function UppyDragDrop({ endpoint, invalidateQueries, onUploadComplete }: UppyDragDropProps) {

    function createUppy() {
        const uppy = new Uppy({
            restrictions: { maxFileSize: 5 * 1024 * 1024, maxTotalFileSize: 20 * 1024 * 1024 },
            onBeforeFileAdded: (file) => { // rename the file to its relativePath so we can preserve folder structure https://stackoverflow.com/a/64503904
                const originalFile = file.data as File;
                const relativePath = originalFile.webkitRelativePath || (file.name ?? 'unnamed');
                file.meta.name = relativePath;

                const modifiedFile = {
                    ...file,
                    name: relativePath,
                }

                return modifiedFile
            },
        }).use(XHR, {
            endpoint: endpoint,
            fieldName: 'files',
            formData: true,
            bundle: true, // bundle multiple files into a single request https://www.gregoryalexander.com/blog/2024/3/25/ensuring-sequential-uppy-uploads-using-the-bundled-xhr-option
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            responseType: 'json',
            getResponseData(xhr) {
                try {
                    const responseBody = xhr.response;
                    console.log('Response body:', responseBody);

                    if (!responseBody.url && xhr.status >= 200 && xhr.status < 300) {
                        responseBody.url = 'uploaded';
                    }

                    return responseBody;
                } catch (error) {
                    console.error('Error processing response:', error);
                    return { url: 'uploaded', status: xhr.status };
                }
            },
        })

        uppy.on('complete', () => {
            if (invalidateQueries) {
                invalidateQueries.forEach(queryKey => {
                    queryClient.invalidateQueries({ queryKey });
                });
            }
        });

        // uppy.on('error', (error, file, response) => {
        //     if (response) { // undefined for some reason
        //         response = response as any;
        //         const res = response as UploadErrorResponse;

        //         error.message = res.response?.message || 'Upload failed';
        //         error.details = undefined;
        //         // error.name = "meno";
        //     }
        // });

        uppy.on('upload-error', (file, error, response) => {
            if (response) {
                response = response as any;
                const res = response as UploadErrorResponse;
                error.message = res.response?.message || 'Upload failed';
                error.details = undefined;

                if (file) {
                    uppy.setState({
                        error: res.response?.message || 'Upload failed',
                        errorFile: file.id,
                    });
                    uppy.setFileState(file.id, {
                        error: res.response?.message || 'Upload failed'

                    });
                }

                uppy.info(`${res.response.message}`, 'error', 8500)
            }
        });

        return uppy
    }

    // IMPORTANT: passing an initaliser function to useState
    // to prevent creating a new Uppy instance on every render.
    // useMemo is a performance hint, not a guarantee.
    const [uppy] = React.useState(createUppy)
    // You can access state reactively with useUppyState
    // const fileCount = useUppyState(
    //     uppy,
    //     (state) => Object.keys(state.files).length,
    // )
    // const totalProgress = useUppyState(uppy, (state) => state.totalProgress)



    const { theme } = useTheme()
    const queryClient = useQueryClient();

    const [results] = useUppyEvent(uppy, 'upload-success');
    React.useEffect(() => {
        if (results) {
            if (onUploadComplete) {
                onUploadComplete();
            }
        }
    }, [results, onUploadComplete]);

    const [uploadSettings, setUploadSettings] = React.useState<UploadSettings>()

    const fetchUploadSettings = async () => {
        try {
            const response = await axios.get('/api/upload/GetUploadSettings')
            const settings = response.data as UploadSettings

            if (settings.allowedExtensions && settings.allowedExtensions.includes('*')) {
                settings.allowedExtensions = null
            }

            setUploadSettings(settings)

            uppy.setOptions({
                restrictions: {
                    maxFileSize: settings.maxFileSize,
                    maxTotalFileSize: settings.maxTotalSize,
                    allowedFileTypes: settings.allowedExtensions,
                    maxNumberOfFiles: settings.maxFiles,
                },
            })

            // uppy.info(`Allowed file types: ${settings.allowedExtensions ?? 'All'}, Max file size: ${settings.maxFileSize / 1024 / 1024} MB, Max total size: ${settings.maxTotalSize / 1024 / 1024} MB`, 'info',)

        } catch (error) {
            console.error('Error fetching upload settings:', error)
        }
    }

    React.useEffect(() => {
        fetchUploadSettings()
    }, [uppy])


    return (
        <>
            <Dashboard
                width="100%"
                theme={theme === 'system' ? 'auto' : theme}
                uppy={uppy}
                note={
                    `${uploadSettings?.maxFileSize ? `file size: ${uploadSettings.maxFileSize / 1024 / 1024} MB, ` : ''}` +
                    `${uploadSettings?.maxTotalSize ? `total size: ${uploadSettings.maxTotalSize / 1024 / 1024} MB, ` : ''}` +
                    `${uploadSettings?.maxFiles ? `files: ${uploadSettings.maxFiles}, ` : ''}` +
                    `${uploadSettings?.allowedExtensions ? `file types: ${uploadSettings.allowedExtensions.join(', ')}` : ''}`
                }
            />
        </>
    )
}
