import React, { useState } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useQuery } from "@tanstack/react-query";
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import { createElement } from "react-syntax-highlighter";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    const languageMap: Record<string, string> = {
        js: "javascript",
        jsx: "jsx",
        ts: "typescript",
        tsx: "tsx",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "scss",

        py: "python",
        java: "java",
        h: "cpp",
        cpp: "cpp",
        cs: "csharp",
        php: "php",
        rb: "ruby",
        swift: "swift",

        json: "json",
        yaml: "yaml",
        yml: "yaml",

        md: "markdown",
    };

    return languageMap[extension] || "text";
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
    // State for controlling the comment dialog and tracking which line is selected
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedLineForComment, setSelectedLineForComment] = useState<number | null>(null);

    async function fetchSubmissionFile() {
        const response = await axios.get(
            `/api/upload/DownloadSubmissionFile/${submissionId}/${encodeURIComponent(fileName!)}`,
            { responseType: "blob" }
        );

        const contentType = response.headers["content-type"];
        setFileType(contentType);
        const blob = new Blob([response.data], { type: contentType });

        if (contentType.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(blob);
            response.data = imageUrl;
        } else if (contentType.startsWith("text/")) {
            const text = await blob.text();
            response.data = text;
        } else {
            response.data = "Unsupported file type.";
        }

        return response.data;
    }

    // This function is now kept for possible future use, e.g. to track line selections
    const handleLineClick = (lineNumber: number, fileContent: string) => {
        console.log(`${lineNumber}, ${fileContent.split("\n")[lineNumber]}`);
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
            <div className="max-w-full overflow-x-hidden">
                <div className="flex items-center justify-center">
                    {!fileName ? (
                        <p>No file selected.</p>
                    ) : isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Error: {error.message}</p>
                    ) : !fileContent ? (
                        <p>No file content.</p>
                    ) : null}
                </div>

                {fileContent && fileName && (
                    <div className="overflow-auto max-w-full max-h-full">
                        {fileType?.startsWith("image/") ? (
                            <img
                                src={fileContent}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        ) : fileType?.startsWith("text/") ? (
                            <SyntaxHighlighter
                                language={getFileLanguage(fileName)}
                                style={materialLight}
                                showLineNumbers={true}
                                wrapLines={true}
                                renderer={({ rows, stylesheet, useInlineStyles }) => {
                                    return rows.map((row, i) => {
                                        // Map over each child token in the row and convert it to a valid React element.
                                        const line = row.children?.map((token, j) =>
                                            createElement({
                                                node: token,
                                                stylesheet,
                                                useInlineStyles,
                                                key: j,
                                            })
                                        );
                                        return (
                                            <div key={i} className="flex items-center">
                                                <Button
                                                    variant={"ghost"}
                                                    // Set the selected line and open the comment dialog on plus click.
                                                    onClick={() => {
                                                        setSelectedLineForComment(i);
                                                        setCommentDialogOpen(true);
                                                    }}
                                                    className="text-blue-500 mr-2"
                                                >
                                                    <Plus />
                                                </Button>
                                                <span style={row.properties?.style}>{line}</span>
                                            </div>
                                        );
                                    });
                                }}
                            >
                                {fileContent}
                            </SyntaxHighlighter>
                        ) : (
                            <a href={fileContent} download={fileName} className="text-blue-500">
                                Download File: {fileName}
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Dialog for Adding a Comment */}
            <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add Comment on Line {selectedLineForComment !== null ? selectedLineForComment + 1 : ""}
                        </DialogTitle>
                    </DialogHeader>
                    <textarea
                        className="w-full p-2 border rounded"
                        placeholder="Enter your comment"
                    />
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                // Here you can add your submit logic.
                                setCommentDialogOpen(false);
                            }}
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export { FilePreviewer, getFileLanguage };
