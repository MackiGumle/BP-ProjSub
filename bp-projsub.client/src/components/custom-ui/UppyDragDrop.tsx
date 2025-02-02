import React from 'react'
import Uppy from '@uppy/core'
import { Dashboard } from '@uppy/react'
import XHR from '@uppy/xhr-upload';

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { useTheme } from '@/components/theme-components/theme-provider';



export function UppyDragDrop({ assignmentId }: { assignmentId: number }) {
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
        })
            .use(XHR, {
                endpoint: `/api/upload/UploadSubmissionFiles/${assignmentId}`,
                fieldName: 'files',
                formData: true,
                bundle: true, // bundle multiple files into a single request https://www.gregoryalexander.com/blog/2024/3/25/ensuring-sequential-uppy-uploads-using-the-bundled-xhr-option
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

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

    return (
        <>
            {/* <p>File count: {fileCount}</p>
            <p>Total progress: {totalProgress}</p> */}
            <Dashboard width="100%" theme={theme === 'system' ? 'auto' : theme} uppy={uppy} />
        </>
    )
}