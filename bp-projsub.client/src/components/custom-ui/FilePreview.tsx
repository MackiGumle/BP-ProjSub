import React, { useState } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useQuery } from "@tanstack/react-query";
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import { createElement } from "react-syntax-highlighter";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { SubmissionCommentDto } from "@/Dtos/SubmissionCommentDto";
import { useAuth } from "@/context/UserContext";
import CommentDialog from "./Dialogs/CommentDialog";

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
    const { hasRole } = useAuth();
    const { data: fileContent, isLoading, error } = useQuery<string, Error>(
        [submissionId, fileName],
        fetchSubmissionFile,
        {
            enabled: !!submissionId && !!fileName,
        }
    );

    const [fileType, setFileType] = useState<string | null>(null);
    // const [selectedLines, setSelectedLines] = useState<number[]>([]);
    // State for controlling the comment dialog and tracking selected line
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedLineForComment, setSelectedLineForComment] = useState<number | null>(null);


    // Query to fetch the submission comments.
    const {
        data: comments,
        // isLoading: commentsLoading,
        // error: commentsError,
        // refetch: refetchComments,
    } = useQuery<SubmissionCommentDto[], Error>(
        ["submissionComments", submissionId],
        async () => {
            const { data } = await axios.get(`/api/Upload/GetSubmissionComments/${submissionId}`);
            return data;
        },
        { enabled: !!submissionId }
    );

    async function fetchSubmissionFile() {
        const response = await axios.get(
            `/api/upload/DownloadSubmissionFile/${submissionId}?file=${encodeURIComponent(fileName!)}`,

            { responseType: "blob" }
        );

        const contentType = response.headers["content-type"];
        setFileType(contentType);
        const blob = new Blob([response.data], { type: contentType });

        if (contentType.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(blob);
            response.data = imageUrl;
        } else if (contentType.startsWith("text/") || contentType.startsWith("application/json")) {
            const text = await blob.text();
            setFileType("text/");
            response.data = text;
        } else if (contentType.startsWith("application/pdf")) {
            const pdfUrl = URL.createObjectURL(blob);
            response.data = pdfUrl;
        } else if (contentType.startsWith("x-zip-compressed")) {
            const zipUrl = URL.createObjectURL(blob);
            response.data = zipUrl;
        }
        // else {
        //     response.data = "Unsupported file type.";
        // }

        return response.data;
    }

    // const renderer = useCallback()


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
                    <div className="overflow-auto max-w-full max-h-full m-auto">
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
                                wrapLongLines={true}
                                customStyle={{ padding: "0" }}
                                lineNumberStyle={{ minWidth: "2em", paddingRight: "1em" }}
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

                                        // Filter comments that belong to this file and line (using 1-based numbering).
                                        const lineComments = comments?.filter(
                                            (c) => c.fileName === fileName && c.lineCommented === i + 1
                                        );

                                        return (
                                            <div key={i} className="flex flex-col">
                                                <div className="flex items-center p-0 m-0  group code-line"
                                                // onMouseEnter={() => setHoveredLine(i)}
                                                // onMouseLeave={() => setHoveredLine(null)}
                                                >
                                                    <span className="flex items-center" style={row.properties?.style}>
                                                        {hasRole("Teacher") && (
                                                            <Button
                                                                variant={"ghost"}
                                                                onClick={() => {
                                                                    setSelectedLineForComment(i);
                                                                    setCommentDialogOpen(true);
                                                                }}
                                                                className={`max-h-[1.5em] max-w-fit text-blue-500 p-0 m-0 plus-button left-0 opacity-0 group-hover:opacity-100`}
                                                            >
                                                                <Plus className="p-0 m-1" />

                                                            </Button>
                                                        )}
                                                        {line}
                                                    </span>
                                                </div>
                                                {lineComments && lineComments.length > 0 && (
                                                    <div className="ml-8">
                                                        {lineComments.map((comment) => (
                                                            <div key={comment.id} className="text-sm text-gray-600 bg-cyan-100">
                                                                {comment.comment}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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

            <CommentDialog
                isOpen={commentDialogOpen}
                onOpenChange={setCommentDialogOpen}
                selectedLine={selectedLineForComment}
                submissionId={submissionId}
                fileName={fileName!}
            />

        </>
    );
};

export { FilePreviewer, getFileLanguage };
