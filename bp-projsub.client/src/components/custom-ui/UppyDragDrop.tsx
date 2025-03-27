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
            // locale: {
            //     strings: {
            //         dropPaste: 'Drop files here or paste',
            //         dropPasteImport: 'Drop files here, paste or import from',
            //         dropHereOr: 'sssDrop files here or %{browse}',
            //         browse: 'browse skibidi bop',
            //     },
            //     pluralize: function (n: number): number {
            //         throw new Error('Function not implemented.');
            //     }
            // }

        }).use(XHR, {
            endpoint: endpoint,
            fieldName: 'files',
            formData: true,
            bundle: true, // bundle multiple files into a single request https://www.gregoryalexander.com/blog/2024/3/25/ensuring-sequential-uppy-uploads-using-the-bundled-xhr-option
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })

        uppy.on('complete', () => {
            if (invalidateQueries) {
                invalidateQueries.forEach(queryKey => {
                    queryClient.invalidateQueries({ queryKey });
                });
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

    const fetchUploadSettings = async () => {
        try {
            const response = await axios.get('/api/upload/GetUploadSettings')
            const settings = response.data

            if (settings.allowedExtensions == '*')
                settings.allowedExtensions = null

            uppy.setOptions({
                restrictions: {
                    maxFileSize: settings.maxFileSize,
                    maxTotalFileSize: settings.maxTotalSize,
                    allowedFileTypes: settings.allowedExtensions,
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
            {/* <p>File count: {fileCount}</p>
            <p>Total progress: {totalProgress}</p> */}
            <Dashboard width="100%" theme={theme === 'system' ? 'auto' : theme} uppy={uppy} />
        </>
    )
}
