import React, { useState } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useQuery } from "@tanstack/react-query";
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";


const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'scss',

        'py': 'python',
        'java': 'java',
        'h': 'cpp',
        'cpp': 'cpp',
        'cs': 'csharp',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',

        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',

        'md': 'markdown'
    };

    return languageMap[extension] || 'text';
};

interface FilePreviewerProps {
    submissionId: string;
    fileName: string | null;
}


const FilePreviewer: React.FC<FilePreviewerProps> = ({ submissionId, fileName }) => {
    const { data: fileContent, isLoading, error } = useQuery<string, Error>(
        [submissionId, fileName],
        fetchSubmissionFile,
        {
            enabled: !!submissionId && !!fileName,
        }
    );


    const [fileType, setFileType] = useState<string | null>(null);
    const [selectedLines, setSelectedLines] = useState<number[]>([]);

    async function fetchSubmissionFile() {
        const response = await axios.get(
            `/api/upload/DownloadSubmissionFile/${submissionId}/${encodeURIComponent(fileName!)}`,
            { responseType: 'blob' }
        );

        const contentType = response.headers["content-type"];
        setFileType(contentType);
        // console.log(contentType);
        const blob = new Blob([response.data], { type: contentType });

        if (contentType.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(blob);
            // setFileContent(imageUrl);
            console.log(imageUrl);
            response.data = imageUrl;
        } else if (contentType.startsWith("text/")) {
            const text = await blob.text();
            // setFileContent(text);
            response.data = text;
        } else {
            // setError("Unsupported file type.");
            response.data = "Unsupported file type.";
        }

        return response.data;
    }

    const handleLineClick = (lineNumber: number, fileContent: string) => {
        console.log(`${Number(lineNumber)}, ${fileContent.split('\n')[lineNumber - 1]}`)
        setSelectedLines((prev) => {
            if (prev.includes(lineNumber)) {
                return prev.filter((line) => line !== lineNumber);
            } else {
                return [...prev, lineNumber];
            }
        });
    };

    return (
        <>
            <div className="max-w-full max-h-5">
                <div className="flex items-center justify-center">
                    {
                        !fileName ? (
                            <p>No file selected.</p>
                        ) : isLoading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p>Error: {error.message}</p>
                        ) : !fileContent && (
                            <p>No file content.</p>
                        )}
                </div>

                {
                    fileContent && fileName && (
                        <div className="overflow-auto max-w-full max-h-full">
                            {fileType?.startsWith("image/") ? (
                                <img src={fileContent} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                            ) : fileType?.startsWith("text/") ? (
                                <SyntaxHighlighter
                                    language={getFileLanguage(fileName)}
                                    style={materialLight}
                                    showLineNumbers={true}
                                    wrapLines={true}
                                    lineProps={(lineNumber) => ({
                                        onClick: () => handleLineClick(lineNumber, fileContent),
                                        style: {
                                            cursor: 'pointer',
                                            backgroundColor: selectedLines.includes(lineNumber) ? 'rgba(0, 0, 0, 0.1)' : 'inherit',
                                        },
                                    })}
                                >
                                    {fileContent}
                                </SyntaxHighlighter>
                            ) : (
                                <a href={fileContent} download={fileName} className="text-blue-500">
                                    Download File: {fileName}
                                </a>
                            )}
                        </div>
                    )
                }
            </div>
        </>
    );
};

export { FilePreviewer, getFileLanguage };