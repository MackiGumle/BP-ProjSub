import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ScanEye } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PlagiarismDialogProps {
    assignmentId: number;
}

const PlagiarismDialog: React.FC<PlagiarismDialogProps> = ({ assignmentId }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [result, setResult] = useState<{ link: string; message: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckPlagiarism = async () => {
        if (!selectedLanguage) {
            setError("Please select a language.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const response = await axios.get(`/api/Upload/CheckPlagiatism/${assignmentId}?language=${selectedLanguage}`);
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className='gap-0'>
                    <ScanEye className="mr-2" />
                    Plagiarism Check
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Plagiarism Check</DialogTitle>
                <div className="space-y-4 mt-4">
                    <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage} className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csharp" id="csharp" />
                            <label htmlFor="csharp">
                                C# <span className="text-gray-400 text-sm">(.cs)</span>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="java" id="java" />
                            <label htmlFor="java">
                                Java <span className="text-gray-400 text-sm">(.java)</span>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="python" id="python" />
                            <label htmlFor="python">
                                Python <span className="text-gray-400 text-sm">(.py)</span>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="javascript" id="javascript" />
                            <label htmlFor="javascript">
                                JavaScript <span className="text-gray-400 text-sm">(.js)</span>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="c" id="c" />
                            <label htmlFor="c">
                                C <span className="text-gray-400 text-sm">(.c, .h)</span>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cc" id="cc" />
                            <label htmlFor="cc">
                                C++ <span className="text-gray-400 text-sm">(.cpp, .h)</span>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="haskell" id="haskell" />
                            <label htmlFor="haskell">
                                Haskell <span className="text-gray-400 text-sm">(.hs)</span>
                            </label>
                        </div>
                    </RadioGroup>
                    {error && <p className="text-red-500">{error}</p>}
                    <Button onClick={handleCheckPlagiarism} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" /> Checking...
                            </>
                        ) : (
                            "Check Plagiarism"
                        )}
                    </Button>
                    {result && (
                        <div className="mt-4 border rounded p-4 bg-gray-50">
                            <p>{result.message}</p>
                            <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                View Report
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PlagiarismDialog;
