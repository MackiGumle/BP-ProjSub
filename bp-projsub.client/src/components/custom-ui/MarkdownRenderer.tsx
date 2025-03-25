import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'; // Keeps unformated text hidden (something to do with the mathematical formulas?)


export const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <Markdown className='markdown'
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <SyntaxHighlighter
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            style={materialLight}
                        />
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    )
                },

                // waste of time
                // img: ({ src, alt }) => <ProtectedImage src={src} alt={alt} />,
                // a: ({ href, children }) => <ProtectedFileLink href={href}>{children}</ProtectedFileLink>
            }}
        >{content}</Markdown>
    );
};