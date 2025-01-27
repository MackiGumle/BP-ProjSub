/* eslint-disable */
import React from 'react'
import { createRoot } from 'react-dom/client'
import Uppy, {
    UIPlugin,
    type Meta,
    type Body,
    type UIPluginOptions,
    type State,
} from '@uppy/core'
import { Dashboard, useUppyState } from '@uppy/react'
import XHR from '@uppy/xhr-upload';


import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { useTheme } from '@/components/theme-components/theme-provider';
import { ThemeToggle } from '@/components/theme-components/theme-toggle';

interface MyPluginOptions extends UIPluginOptions { }

interface MyPluginState extends Record<string, unknown> { }

// Custom plugin example inside React
class MyPlugin<M extends Meta, B extends Body> extends UIPlugin<
    MyPluginOptions,
    M,
    B,
    MyPluginState
> {
    container!: HTMLElement

    constructor(uppy: Uppy<M, B>, opts?: MyPluginOptions) {
        super(uppy, opts)
        this.type = 'acquirer'
        this.id = this.opts.id || 'TEST'
        this.title = 'Test'
    }

    override install() {
        const { target } = this.opts
        if (target) {
            this.mount(target, this)
        }
    }

    override uninstall() {
        this.unmount()
    }

    override render(state: State<M, B>, container: HTMLElement) {
        // Important: during the initial render is not defined. Safely return.
        if (!container) return
        createRoot(container).render(
            <h2>React component inside Uppy's Preact UI</h2>,
        )
    }
}

const metaFields = [
    { id: 'license', name: 'License', placeholder: 'specify license' },
]

function createUppy() {
    // return new Uppy({ restrictions: { requiredMetaFields: ['license'] } })
    return new Uppy({
        restrictions: { maxFileSize: 5 * 1024 * 1024, maxTotalFileSize: 20 * 1024 * 1024 },
        //  allowMultipleUploadBatches: false,
    })
        .use(MyPlugin)
        .use(XHR, {
            endpoint: `api/upload/${2}`,
            fieldName: 'files',
            formData: true,
            bundle: true, // bundle multiple files into a single request https://www.gregoryalexander.com/blog/2024/3/25/ensuring-sequential-uppy-uploads-using-the-bundled-xhr-option
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
}

export function TestingPage() {
    // IMPORTANT: passing an initaliser function to useState
    // to prevent creating a new Uppy instance on every render.
    // useMemo is a performance hint, not a guarantee.
    const [uppy] = React.useState(createUppy)
    // You can access state reactively with useUppyState
    const fileCount = useUppyState(
        uppy,
        (state) => Object.keys(state.files).length,
    )
    const totalProgress = useUppyState(uppy, (state) => state.totalProgress)
    // Also possible to get the state of all plugins.
    const plugins = useUppyState(uppy, (state) => state.plugins)
    const { theme } = useTheme()

    return (
        <>
            <p>File count: {fileCount}</p>
            <p>Total progress: {totalProgress}</p>
            <Dashboard theme={theme === 'system' ? 'auto' : theme} uppy={uppy} metaFields={metaFields} />
            <ThemeToggle />
        </>
    )
}