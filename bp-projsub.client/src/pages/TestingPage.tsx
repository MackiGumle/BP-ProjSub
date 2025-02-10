import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import { useParams, useSearchParams } from "react-router-dom";
import remarkGfm from 'remark-gfm'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { SimpleTimePicker } from '@/components/ui/simple-time-picker';
import { DatetimePicker } from '@/components/ui/datetime-picker';

export function TestingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const submissionId = "1035";
  const fileName = searchParams.get('file');

  const markdown = `Here is some JavaScript code:

  ~~~js
 import type {Element} from 'hast'

type Components = Partial<{
  [TagName in keyof JSX.IntrinsicElements]:
    // Class component:
    | (new (props: JSX.IntrinsicElements[TagName] & ExtraProps) => JSX.ElementClass)
    // Function component:
    | ((props: JSX.IntrinsicElements[TagName] & ExtraProps) => JSX.Element | string | null | undefined)
    // Tag name:
    | keyof JSX.IntrinsicElements
}>
  ~~~

[Link](https://localhost:5173/subject/1037/assignments/1110?open=Homework)

A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b | c | d |
| - | - | - | - |
| 1 | 2 | 3 | 4 |


Beanos:
![sss](https://wallpaperaccess.com/full/1926550.jpg)
  `
  const [isAssignmentOpen, setAssignmentOpen] = useState<boolean>(false);


  return (
    <>
      <Collapsible
        open={isAssignmentOpen}
        onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}
      >
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-xl font-semibold">Název zadání</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${isAssignmentOpen ? 'rotate-180' : ''
                }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 py-4">

            <Markdown className='markdown'
              // children={markdown}
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props
                  const match = /language-(\w+)/.exec(className || '')
                  console.log(match)
                  return match ? (
                    <SyntaxHighlighter
                      PreTag="div"
                      children={String(children).replace(/\n$/, '')}
                      language={match[1]}
                      style={docco}
                    />
                  ) : (
                    <code {...rest} className={className}>
                      {children}
                    </code>
                  )
                }
              }}
            >{markdown}</Markdown>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </>
  );
}
